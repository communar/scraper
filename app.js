const credentials = require('./db/credentials.js')
const cron = require('node-cron')
const fs = require('fs')
const log = require('cllc')()
const mailer = require('./rep/mailer.js')(credentials)
const path = require('path')
const Raven = require('raven')
const scraper = require('./rep/scraper.js')

Raven.config(credentials.log.sentry).install()
Raven.setContext({
    user: {
        email: credentials.log.email,
        id: 'Scraper-app'
    }
})

// Cron-демон запускает скрипт в нулевую минуту в 12 часов каждые сутки 
// Система взаимодействия всего функционала
cron.schedule('* * * * *', () => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0 // Для сертификации
    scraper.start() // Запуск парсинга
    scraper.promiseSuccess
        // После разрешения ожидания загрузки использованиерезультатов парсинга
        // считывает их и передаёт дальше
        .then(() => JSON.parse(fs.readFileSync('./db/res/data.json', 'utf-8')))
        .then(parsed => {
            // Наполняет "тело" будущего email
            let emailBody = '<h1>Электронные аукционы:</h1>'

            parsed.forEach(obj => {
                emailBody += `
                            <ul><a href="${obj.url}">${obj.author}</a>
                                <li>Бюджет: ${obj.pay}</li>
                                <li>Этап закупки: ${obj.stage}</li>
                                <li>Описание: ${obj.des}</li>
                            </ul>
                        `
            })

            return emailBody
        })
        .then(emailBody => {
            // Отправка сообщения
            log('Отправление сообщения')
            //mailer.send(credentials.customers.user1, emailBody)
            mailer.send(credentials.customers.user2, emailBody)
        })
        .catch(err => {
            try {
                throw err
            } catch (err) {
                log.e(`Ошибка загрузки файлов: ${err}`)
                Raven.captureException(err)
            }
        })
})
