const qs = require('querystring')
const Router = require('routes')
const cuid = require('cuid')
const ecstatic = require('ecstatic')({
  root: __dirname + '/public',
  handleErrors: false
})

module.exports = serve

const router = new Router()

router.addRoute('GET /sl/:slug', redirect)

router.addRoute('POST /shorten', submitLongUrl)

async function redirect(req, res, match, index) {
  index.get(match.slug, (err, val) => {
    if(err) return res.end(err)
    res.writeHead(302, { 'Location': val })
    res.end()
  })
}

function submitLongUrl(req, res, match, index, log) {
  console.log(match)
  const query = qs.parse(req.url.split('?')[1])
  const value = {
    cuid: cuid(),
    shortURL: cuid.slug(),
    longURL: query.url
  }

  log.heads((err, heads) => {
    console.log('HEAD', heads)
    if(err) return console.error(err)
    log.add((heads[0] || heads), value, async(err, node) => {
      console.log('NODE', node)
      if(err) return console.error(err)
      try {
        await index.put(node.value.shortURL, node.value.longURL)
        console.log(node)
        res.end(JSON.stringify(node.value))
      } catch(err) {
        console.error(err)
      }
    })
  })
}

function serve (index, log) {
  return function (req, res) {
    const match = router.match(req.method + ' ' + path(req))
    if(match) match.fn(req, res, match.params, index, log)
    else ecstatic(req, res)
  }
}

function path(req) {
  return req.url.split('?')[0]
}


