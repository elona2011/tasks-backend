const jwt = require('jsonwebtoken')
const { verifyOpenid, addDyAccount } = require('../sql/account')
const { jwt_key, getRes } = require('../config')

const setOpenid = async (ctx, next) => {
    console.log(ctx.request.body.token)
    let decoded
    try {
        decoded = jwt.verify(ctx.request.body.token, jwt_key)
    } catch (error) {
        return ctx.body = getRes('openidNotFound')
    }
    let result = await verifyOpenid(decoded.openid || decoded.userOpenId)
    console.log(result)
    if (result.length != 1) {
        return ctx.body = getRes('openidNotFound')
    }
    ctx.openid = result[0].wx_openid

    await next()
}

module.exports = setOpenid
