const Router = require("@koa/router")
const { accessToken } = require('../interfaces/dy')

const router = new Router({ prefix: '/dy' });

router.post('/access_token', async (ctx) => {
    console.log('/access_token', ctx.request.body)
    console.log('ctx.request.query.code', ctx.request.query.code)
    await accessToken(ctx.request.query.code)
    ctx.body = {
        code: 0,
        result: 0,
    }
})

module.exports = router