const forever = require('forever-monitor')
const child = new(forever.Monitor)('app.js', {
    max: 10,
    silent: true,
    minUptime: 5000,
    spinSleepTime: 3600000,
    watch: false,
    options: []
})

child.on('start', () => {
    console.log('Forever goes forever')
})

child.on('restart', function() {
    console.error(`Forever restarting script for ${child.times} time`)
})

child.on('exit:code', code => {
    console.error(`app.js has exited after restart with code: ${code}`)
})

child.start()