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
  if(node.value.method) {
    return html`
      <p><span class="get bold">/${node.value.method}</span> ${node.value.url}</p>
    `
  }
  return html`
    <p>
      <span class="slug bold">SLUG</span> ${node.value.slug}
      <span class="slug bold">URL</span> ${node.value.longURL}
    </p>
  `
}

