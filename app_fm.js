const credentials = require('./db/credentials.js')
const forever = require('forever-monitor')
const log = require('cllc')()
const Raven = require('raven')
const child = new(forever.Monitor)('app.js', {
    max: 10,
    silent: true,
    minUptime: 5000,
    spinSleepTime: 1800000,
    watch: false,
    options: []
})


Raven.config(credentials.log.sentry).install()
Raven.setContext({
    user: {
        email: credentials.log.email,
        id: 'Forever-monitor'
    }
})

child.on('restart', () => {
    log.w(`Forever restarting script for ${child.times} time`)
})

child.on('exit:code', code => {
    log.e(`app.js has exited after restart with code: ${code}`)
})

child.start()