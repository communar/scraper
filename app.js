const credentials = require('./credentials.js')
const cron = require('node-cron')
const express = require('express')
const fs = require('fs')
const handlebars = require('express-handlebars')
    .create({ defaultLayout: 'main' })
const message = require('./rep/message.js')(credentials)
const morgan = require('morgan')
const path = require('path')
const rfs = require('rotating-file-stream');
const scraper = require('./rep/scraper.js')
const sections = require('express-handlebars-sections')
const session = require('express-session')

const logDirectory = path.join(__dirname, 'log') // директория для логгов
const app = express()

// Cron-демон запускает срикпт раз в сутки
// Система взаимодействия всего функционала
cron.schedule('0 * * * *', () => {
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

app.set('port', process.env.PORT || 2828) // настройка порта

fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory) // директория для логгирования

switch (app.get('env')) {
    case 'development':
        app.use(morgan('dev')) // многоцветное журналирование
        break
    case 'production':
        app.use(morgan('combined', {
            stream: rfs('requests.log', {
                interval: '1d', // чередование файлов журналов
                path: logDirectory
            })
        }))
        break
}

// Подключение handlebars-представлений и handlebars-секций
sections(handlebars)
app.engine('handlebars', handlebars.engine)
app.set('view engine', 'handlebars')

// Работа с cookie
app.use(require('cookie-parser')(credentials.cookieSecret))
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: credentials.cookieSecret
}))

// Загрузка основной страницы (любой запрос)
app.get('/', (req, res) => {
    res.render('data')
})

// Страница 404
app.use((req, res) => {
    res.status(404)
    res.render('404')
})
// Страница 500
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500)
    res.render('500')
})

app.listen(app.get('port'), () => {
    console.log(`Express запущен в режиме ${app.get('env')} на http://localhost: ${app.get('port')}; нажмите Ctrl+C для завершения.`)
})