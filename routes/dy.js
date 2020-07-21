const Router = require("@koa/router")
const { accessToken } = require('../interfaces/dy')
const jwt = require('jsonwebtoken')
const { jwt_key } = require('../config')
const { addUser } = require('../sql/account')
const { getOk, getRes } = require('../returnCode')

const router = new Router({ prefix: '/dy' });

router.get('/access_token', async (ctx) => {
    console.log('/access_token', ctx.request.body)
    console.log('ctx.request.query.code', ctx.request.query.code)
    let r = await accessToken(ctx.request.query.code)
    ctx.jwtToken = jwt.sign({ openid: r.openid }, jwt_key)
    await addUser(r.openid, ctx.jwtToken, r.access_token)
    ctx.body = getOk(ctx.jwtToken)
})

module.exports = router