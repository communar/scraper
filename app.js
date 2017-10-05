const credentials = require('./credentials.js')
const cron = require('node-cron')
const fs = require('fs')
const message = require('./rep/message.js')(credentials)
const path = require('path')
const scraper = require('./rep/scraper.js')

// Cron-демон запускает скрипт в нулевую минуту в 12 часов каждые сутки 
// Система взаимодействия всего функционала
cron.schedule('* * * * *', () => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0 // Для сертификации
    scraper.start() // Запуск парсинга
    scraper.promiseSuccess
        // После разрешения ожидания загрузки результатов парсинга
        // считывает их и передаёт дальше
        .then(() => JSON.parse(fs.readFileSync('./db/data.json', 'utf-8')))
        .then(parsed => {
            // Наполняет "тело" будущего email
            let emailBody = '<h1>Новые электронные аукционы</h1>'

            parsed.forEach(obj => {
                emailBody += `
                            <ul><a href="${obj.url}">${obj.author}</a>
                                <li>Бюджет: ${obj.pay}</li>
                                <li>Описание: ${obj.des}</li>
                            </ul>
                        `
            })

            return emailBody
        })
        .then(emailBody => {
            // Отправка сообщения
            message.send('serlexcloud@gmail.com', emailBody)
        })
        .catch(err => console.error(`Ошибка загрузки файлов: ${err}`))
})