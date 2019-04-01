var express = require('express')
require('dotenv').config()
var port = process.env.PORT || 3002
var jwt = require('express-jwt')
var jwks = require('jwks-rsa')

var jwtCheck = jwt({
  secret: jwks.expressJwtSecret({
    cache: true,
    rateLimit: true,
    jwksRequestsPerMinute: 5,
    jwksUri: `https://${
      process.env.REACT_APP_AUTH0_DOMAIN
    }/.well-known/jwks.json`,
    strictSsl: false
  }),
  aud: `${process.env.REACT_APP_AUTH0_AUDIENCE}`,
  issuer: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/`,
  algorithms: ['RS256']
})

var app = express()
app.get('/public', function (req, res) {
  res.json({ message: 'hello web api' })
})
app.use(jwtCheck)
app.get('/category', function (req, res) {
  res.json({ message: 'Secured Resource' })
})

app.listen(port)
