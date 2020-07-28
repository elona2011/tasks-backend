const Router = require("@koa/router")
const { accessToken,accessTokenApp } = require('../interfaces/dy')
const jwt = require('jsonwebtoken')
const { jwt_key } = require('../config')
const { addUser } = require('../sql/account')
const { getOk } = require('../returnCode')

const router = new Router({ prefix: '/dy' });

router.get('/access_token', async (ctx) => {
    let r = await accessToken(ctx.request.query.code)
    ctx.jwtToken = jwt.sign({ openid: r.open_id }, jwt_key)
    await addUser(r.open_id, ctx.jwtToken, r.access_token)
    ctx.body = getOk({
        open_id: r.open_id,
        access_token: r.access_token,
        expires_in:r.expires_in,
    })
})

router.get('/access_token_app', async (ctx) => {
    let r = await accessTokenApp(ctx.request.query.code)
    ctx.jwtToken = jwt.sign({ openid: r.open_id }, jwt_key)
    await addUser(r.open_id, ctx.jwtToken, r.access_token)
    ctx.body = getOk({
        open_id: r.open_id,
        access_token: r.access_token,
        expires_in:r.expires_in,
    })
})

module.exports = router