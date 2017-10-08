// Подключение модулей
const urls = require('../db/credentials.js').urls
const fs = require('fs')
const resolve = require('url').resolve // Преобразование ссылки в абсолютную
const needle = require('needle') // Получение html-страницы
const tress = require('tress') // Рекурсивная функция для ссылок
const cheerio = require('cheerio') // DOM-парсер с ядром jQuery

// Функция для запуска парсинга извне модуля
const start = () => {

    if (results.length !== 0) {
        results.splice(0, results.length)
    }
    urls.forEach(url => {
        needle.get(url, (err, res) => {
            if (!err && res.statusCode === 200) {
                let $ = cheerio.load(res.body)

                // Проверка представленных планов закупок
                $('.tenderTd dt>strong').each(i => {
                    if ($('.tenderTd dt>strong').eq(i).text().replace(/\s+/g, ' ').trim() === 'Электронный аукцион') {
                        // Преобразование ссылки конкретного плана закупки
                        // и её добавление в очередь модуля tress
                        q.push(resolve(url, $('.descriptTenderTd dt>a').eq(i).attr('href')))
                    }
                })
            } else {
                throw err
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
            results.push({
                'url': url,
                'author': $('.noticeTabBoxWrapper tbody').eq(1).children()[0].children[3].children[0].data,
                'pay': $('.noticeTabBoxWrapper tbody').eq(3).children()[0].children[3].children[0].data,
                'stage': $('.noticeTabBoxWrapper tbody').eq(0).children()[5].children[3].children[0].data,
                'des': $('.noticeTabBoxWrapper tbody').eq(0).children()[4].children[3].children[0].data
            })
            callback()
        } else {
            console.error(err)
        }
    })

}

// Массив с результатами парсинга
let results = []
// Настройка функционирования асинхронной очереди по закупкам
const q = tress(scrap, -5000)
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
