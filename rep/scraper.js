// Подключение модулей
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
    needle.get(basicUrl, (err, res) => {
        if (!err && res.statusCode === 200) {
            let $ = cheerio.load(res.body)

            // Проверка представленных планов закупок
            $('.tenderTd dt>strong').each(i => {
                if ($('.tenderTd dt>strong').eq(i).text().replace(/\s+/g, ' ').trim() === 'Электронный аукцион') {
                    // Преобразование ссылки конкретного плана закупки
                    // и её добавление в очередь модуля tress
                    q.push(resolve(basicUrl, $('.descriptTenderTd dt>a').eq(i).attr('href')))
                }
            });
        } else {
            throw err
        }
    });

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

// Ссылка на результаты запроса
const basicUrl = 'http://zakupki.gov.ru/epz/order/quicksearch/search_eis.html?searchString=%D0%BA%D0%BE%D0%BC%D0%B8%D1%82%D0%B5%D1%82+%D0%B8%D0%BD%D1%84%D0%BE%D1%80%D0%BC%D0%B0%D1%86%D0%B8%D0%BE%D0%BD%D0%BD%D1%8B%D1%85+%D1%82%D0%B5%D1%85%D0%BD%D0%BE%D0%BB%D0%BE%D0%B3%D0%B8%D0%B9&pageNumber=1&sortDirection=false&recordsPerPage=_20&showLotsInfoHidden=false&fz44=on&fz223=on&af=on&ca=on&priceFrom=&priceTo=&currencyId=1&agencyTitle=&agencyCode=&agencyFz94id=&agencyFz223id=&agencyInn=&regions=&publishDateFrom=&publishDateTo=&sortBy=UPDATE_DATE&updateDateFrom=&updateDateTo='
// Массив с результатами парсинга
let results = []
// Настройка функционирования асинхронной очереди по закупкам
const q = tress(scrap)
const qPromise = new Promise((resolve, reject) => {
    // Сработает при последнем callback
    q.drain = () => {
        fs.writeFileSync('./db/data.json', JSON.stringify(results, null, 4))
        resolve()
    }
    // Сработает при ошибке
    q.error = err => reject(err)
})

module.exports = {
    start: start,
    promiseSuccess: qPromise
}
