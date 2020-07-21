const Router = require("@koa/router")
const { accessToken } = require('../interfaces/dy')
const jwt = require('jsonwebtoken')
const { jwt_key } = require('../config')
const { addUser } = require('../sql/account')
const { getOk } = require('../returnCode')

const router = new Router({ prefix: '/dy' });

router.get('/access_token', async (ctx) => {
    let r = await accessToken(ctx.request.query.code)
    ctx.jwtToken = jwt.sign({ openid: r.open_id }, jwt_key)
    await addUser(r.open_id, ctx.jwtToken, r.access_token)
    ctx.body = getOk(ctx.jwtToken)
})

module.exports = router