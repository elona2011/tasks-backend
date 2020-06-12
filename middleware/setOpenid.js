const jwt = require('jsonwebtoken')
const { verifyOpenid, addDyAccount } = require('../sql/account')
const { jwt_key, r } = require('../config')

const setOpenid = async (ctx, next) => {
    let decoded = jwt.verify(ctx.request.body.token, jwt_key)
    let result = await verifyOpenid(decoded.openid || decoded.userOpenId)
    console.log(result)
    if (result.length != 1) {
        return ctx.body = r['openidNotFound']
    }
    ctx.openid = result[0].wx_openid

    await next()
}

module.exports = setOpenid
