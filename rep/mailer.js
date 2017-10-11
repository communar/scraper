const credentials = require('../db/credentials.js')
const log = require('cllc')()
const nodemailer = require('nodemailer')
const Raven = require('raven')

Raven.config(credentials.log.sentry).install()
Raven.setContext({
    user: {
        email: credentials.log.email,
        id: 'Mailer-script'
    }
})

module.exports = credentials => {

    // Создание "транспорта" SMTP
    const mailTransoprt = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: credentials.gmail.user,
                pass: credentials.gmail.password
            }
        }),
        from = `"Scraper-app" <${credentials.log.email}>`,
        errorLogEmail = credentials.log.email

    return {
        // Отправка письма адресату to
        send: (to, body) => {
            try {
                mailTransoprt.sendMail({
                    from: from,
                    to: to,
                    subject: 'Результаты',
                    html: body,
                    generateTextFromHtml: true
                }, err => {
                    if (err) {
                        throw err
                    }
                })
                log.finish('Информация передана')
            } catch (err) {
                    log.e(`Невозможно отправить письмо: ${err}`)
                    Raven.captureException(err)
                }
        },
        // Отправка письма адресанту в случае ошибки
        emailError: (message, filename, exception) => {
            try {
            let body = `Message: <br><pre>${message}</pre><br>`

            if (exception) {
                body += `exception: <br><pre>${exception}</pre><br>`
            }
            if (filename) {
                body += `filename: <br><pre>${filename}</pre><br>`
            }
            mailTransoprt.sendMail({
                from: from,
                to: errorLogEmail,
                subject: 'Ошибка приложения',
                html: body,
                generateTextFromHtml: true
            }, err => {
                if (err) {
                        throw err
                }
            })
        } catch (err) {
                log.e(`Невозможно отправить письмо об ошибке: ${err}`)
                Raven.captureException(err)
            }
        }
    }
}
