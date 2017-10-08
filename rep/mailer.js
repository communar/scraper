const nodemailer = require('nodemailer')

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
        from = '"Parser-info" <lexsergienko@gmail.com>',
        errorLogEmail = 'lexsergienko@gmail.com'

    return {
        // Отправка письма адресату to
        send: (to, body) => {
            mailTransoprt.sendMail({
                from: from,
                to: to,
                subject: 'Результаты',
                html: body,
                generateTextFromHtml: true
            }, err => {
                if (err) {
                    console.error(`Невозможно отправить письмо: ${err}`)
                }
            })
        },
        // Отправка письма адресанту в случае ошибки
        emailError: (message, filename, exception) => {
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
                    console.error(`Невозможно отправить письмо: ${err}`)
                }
            })
        }
    }
}
