var express = require('express')
require('dotenv').config()
var port = process.env.PORT || 3002
var jwt = require('express-jwt') // validate JWT and set req.server
var jwks = require('jwks-rsa') // retrieve RSA key from a JSON web key set (JWKS) endpoint
var checkScopes = require('express-jwt-authz') // validates JWT scopes
function checkRole (role) {
  return function (req, res, next) {
    console.log(req.user)
    const assignedRoles = req.user['http://localhost:300/roles']
    console.log(assignedRoles)
    if (Array.isArray(assignedRoles) && assignedRoles.includes(role)) {
      return next()
    } else {
      return res.status(401).send('Insufficient role.')
    }
  }
}
var jwtCheck = jwt({
  // dynamically provide a signing key based on the kind in the header
  // and the signing key provided by the JWKS endpoint
  secret: jwks.expressJwtSecret({
    cache: true, // cache the signing key
    rateLimit: true,
    jwksRequestsPerMinute: 5, // prevent attackers from requesting 5 times per minute
    jwksUri: `https://${
      process.env.REACT_APP_AUTH0_DOMAIN
    }/.well-known/jwks.json`,
    strictSsl: false
  }),
  // validate audience and issuer
  aud: `${process.env.REACT_APP_AUTH0_AUDIENCE}`,
  issuer: `https://${process.env.REACT_APP_AUTH0_DOMAIN}/`,

  // this must match the algorithm selected in the Auth0 dashboard under your app's advanced setting under the OAth tab
  algorithms: ['RS256']
})

var app = express()
app.get('/public', function (req, res) {
  res.json({ message: 'hello web api' })
})
app.get('/category', jwtCheck, checkScopes(['read:category']), function (
  req,
  res
) {
  res.json({
    categories: [
      { id: 1, title: 'category a' },
      { id: 2, title: 'category b' },
      { id: 3, title: 'category c' },
      { id: 4, title: 'category d' }
    ]
  })
})
app.get(
  '/admin',
  jwtCheck,
  // checkScopes(['write:category']),
  checkRole('admin'),
  function (req, res) {
    res.json({ message: 'it is an admin call' })
  }
)
app.listen(port)
