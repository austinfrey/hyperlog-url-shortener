const http = require('http')
const ws = require('websocket-stream')
const level = require('level')
const hyperlog = require('hyperlog')
const router = require('./router')

const db = level('./.ws.db')
const slugs = level('./.slugs', {valueEncoding: 'json'})
const log = hyperlog(db, {valueEncoding: 'json'})

const server = http.createServer(router(slugs, log))

server.listen(8088)

const wss = ws.createServer({server: server}, replicate)

function replicate(stream, req) {
  stream.pipe(log.replicate({live: true})).pipe(stream)
}
