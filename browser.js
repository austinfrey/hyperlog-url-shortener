const ws = require('websocket-stream')
const through = require('through2')
const level = require('level-browserify')
const hyperlog = require('hyperlog')
const html = require('yo-yo')

const db = level('./.ws.db')
const log = hyperlog(db, {valueEncoding: 'json'})
const div = document.getElementById('hyperlog')

const wss = ws('ws://' + location.host)

wss.pipe(log.replicate({live: true})).pipe(wss)

const changesFeed = log.createReadStream({live: true})
changesFeed.on('data', node => {
  console.log(node)
  div.prepend(showNode(node))
})

function showNode(node) {
  return html`
   <p>${JSON.stringify(node) + '\n'}</p>
  `
}

