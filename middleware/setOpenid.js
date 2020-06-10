const jwt = require('jsonwebtoken')
const { verifyOpenid, addDyAccount } = require('../sql/account')
const { jwt_key, results } = require('../config')

const setOpenid = async (ctx, next) => {
    let decoded = jwt.verify(ctx.request.body.token, jwt_key)
    let result = await verifyOpenid(decoded.openid || decoded.userOpenId)
    console.log(result)
    if (result.length != 1) {
        return ctx.body = results['openid not found']
    }
    ctx.openid = result[0].wx_openid

    await next()
}

module.exports = setOpenid
