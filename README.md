# Scrape App
***Desription:*** Actual information about public procurements with Express.js and Nodemailer  
***Used Tools:*** Express, Nodemailer, Cron, forever, morgan

## How to run
First use 
```sh
$ yarn init
```
In the console call:
```sh
$ node app_fm.js
```
to run application by the forever-daemon or
```sh
$ node app.js
``` 
to create independent node-server

## Warning! 
### There are some necessary steps to app operation:
1. Create file with passwords and cookie-secret named _credentials.js_
```js
module.exports = {
    cookieSecret: 'one two three four',
    gmail: {
        user: 'yourmail@gmail.com',
        password: 'qwertyuiopas' // Gmail's app-password
    }
}
```
2. It's good if you will create such repositories: _./db/_ and _./var/log/_

### Todos
 - Colorizing new JSON scrape-result
 - Clustering server
 
#### Additional comments:
 - Try to use [PlainTask](https://github.com/aziz/PlainTasks) to manage development process