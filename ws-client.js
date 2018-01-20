const ws = require('websocket-stream')
const level = require('level')
const hyperlog = require('hyperlog')

const wss = ws('ws://localhost:8088')
const db = level('./.ws-clone.db')
const log = hyperlog(db)

wss.pipe(log.replicate({live: true})).pipe(wss)

wss.on('data', data => console.log(data.toString()))
