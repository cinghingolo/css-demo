var proxyquire = require('proxyquire')
var server = proxyquire('../../server', { './api': require('./../mock-api')});

module.exports = server

server.listen(3000)
console.log('listening')
