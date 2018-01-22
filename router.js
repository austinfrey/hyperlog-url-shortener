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

router.addRoute('POST /data', getUrlData)

router.addRoute('POST /shorten', submitLongUrl)

async function redirect(req, res, match, index, log) {
  index.get(match.slug, (err, val) => {
    if(err) return res.end(err)
    const value = {
      slug: match.slug,
      foreignKey: val.foreignKey,
      headers: req.headers,
      url: req.url,
      method: req.method
    }

    log.append(value, (err, node) => {
      if(err) console.error(err)
      res.writeHead(302, { 'Location': val.longURL })
      res.end()
    })
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
    slug: cuid.slug(),
    longURL: query.url
  }

  log.append(value, async(err, node) => {
    if(err) return console.error(err)
    const indexVal = {
      longURL: node.value.longURL,
      foreignKey: node.key
    }

    try {
      await index.put(node.value.slug, indexVal)
      console.log(node)
      res.end(JSON.stringify(node.value))
    } catch(err) {
      console.error(err)
    }
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


