# Scrape App
***Desription:*** Actual information about public procurements to your email

## How to run
At first install all npm-packages.
At second attitude a node-cron module in app.js file.
At third run application:
```sh
$ node app.js
```
or if you want to use forever-daemon (so far there is no need for this)
```sh
$ node app_fm.js
```

## Warning! 
### There are some necessary steps to app operation:
1. Create file with all privacy information named _credentials.js_ in _./db/_ like this:
```js
module.exports = {
    gmail: {
        user: 'yourmail@gmail.com',
        password: 'qwertyuiopas' // Gmail app-password
    },
    customers: {
        user1: usersemail@example, // Add more if you want more
    },
    log: {
        email: 'yourmail@gmail.com',
        sentry: '...' // I use Sentry+Raven, exactly you can use whatever you want (just removed all errors handling with Raven)
    },
    urls: ['first-url', 'second-url']
}