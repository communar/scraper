// Подключение модулей
const credentials = require('../db/credentials.js')
const urls = credentials.urls
const fs = require('fs')
const log = require('cllc')()
const resolve = require('url').resolve // Преобразование ссылки в абсолютную
const needle = require('needle') // Получение html-страницы
const tress = require('tress') // Рекурсивная функция для ссылок
const Raven = require('raven')
const cheerio = require('cheerio') // DOM-парсер с ядром jQuery

Raven.config().install()
Raven.setContext({
    user: {
        email: credentials.log.email,
        id: 'Scraper-script'
    }
})

// Функция для запуска парсинга извне модуля
const start = () => {

    if (results.length !== 0) {
        results.splice(0, results.length)
    }
    log('Начало работы')
    log.start('Проверено ссылок: %s. Добавлено аукционов: %s. Обработано аукционов: %s')
    urls.forEach(url => {
        log.step(1, 0, 0)
        needle.get(url, (err, res) => {
            if (!err && res.statusCode === 200) {
                let $ = cheerio.load(res.body)

                // Проверка представленных планов закупок
                $('.tenderTd dt>strong').each(i => {
                    if ($('.tenderTd dt>strong').eq(i).text().replace(/\s+/g, ' ').trim() === 'Электронный аукцион') {
                        // Преобразование ссылки конкретного плана закупки
                        // и её добавление в очередь модуля tress
                        log.step(0, 1, 0)
                        q.push(resolve(url, $('.descriptTenderTd dt>a').eq(i).attr('href')))
                    }
                })
            } else {
                try {
                    throw err
                } catch (err) {
                    log.e(`Ошибка подключения к серверу: ${err}`)
                    Raven.captureException(err)
                }
            }
        })
    }) 
}

// Непосредственно парсинг
const scrap = (url, callback) => {

    needle.get(url, (err, res) => {
        if (!err && res.statusCode === 200) {
            let $ = cheerio.load(res.body)

            // Добавление нужной информации в массив
            log.step(0, 0, 1)
            results.push({
                'url': url,
                'author': $('.noticeTabBoxWrapper tbody').eq(1).children()[0].children[3].children[0].data,
                'pay': $('.noticeTabBoxWrapper tbody').eq(3).children()[0].children[3].children[0].data,
                'stage': $('.noticeTabBoxWrapper tbody').eq(0).children()[5].children[3].children[0].data,
                'des': $('.noticeTabBoxWrapper tbody').eq(0).children()[4].children[3].children[0].data
            })
            callback()
        } else {
            log.w(`Битый адрес... ${err}`)
        }
    })

}

// Массив с результатами парсинга
let results = []
// Настройка функционирования асинхронной очереди по закупкам
const q = tress(scrap, 2)
const qPromise = new Promise((resolve, reject) => {
    // Сработает при последнем callback
    q.drain = () => {
        fs.writeFileSync('./db/res/data.json', JSON.stringify(results, null, 4))
        resolve()
    }
    // Сработает при ошибке
    q.error = err => reject(err)
})

module.exports = {
    start: start,
    promiseSuccess: qPromise
}
