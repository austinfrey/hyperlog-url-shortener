const qs = require('querystring')
const Router = require('routes')
const cuid = require('cuid')
const through = require('through2')
const ecstatic = require('ecstatic')({
  root: __dirname + '/public',
  handleErrors: false
})

module.exports = serve

const router = new Router()

router.addRoute('GET /sl/:slug', redirect)

router.addRoute('GET /data', getUrlData)

router.addRoute('POST /shorten', submitLongUrl)

async function redirect(req, res, match, index) {
  index.get(match.slug, async(err, val) => {
    if(err) return res.end(err)
    try {
      val.hits++
      index.put(match.slug, val)
      res.writeHead(302, { 'Location': val.longURL })
      res.end()
    } catch(err) {
      console.error(err)
    }
  })
}

function getUrlData(req, res, match, index) {
  const urlStream = index.createReadStream()
  urlStream.pipe(through.obj(function(chunk, enc, next) {
    this.push(JSON.stringify(chunk) + '\n')
    next()
  })).pipe(res)
}

function submitLongUrl(req, res, match, index, log) {
  const query = qs.parse(req.url.split('?')[1])
  const value = {
    cuid: cuid(),
    shortURL: cuid.slug(),
    longURL: query.url
  }

  log.heads((err, heads) => {
    if(err) return console.error(err)
    log.add((heads[0] || heads), value, async(err, node) => {
      if(err) return console.error(err)

      const indexVal = {
        longURL: node.value.longURL,
        hits: 0
      }

      try {
        await index.put(node.value.shortURL, indexVal)
        index.get(node.value.shortURL, (err, val) => console.log(err || val))
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


