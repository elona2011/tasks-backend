const xml2js = require("xml2js")
const { createHash } = require('crypto');
const jwt = require('jsonwebtoken')
const { jwt_key, token } = require('../config')
const { addUser, getToken } = require('../sql/account')
const { saveUnifiedorder } = require('../sql/pay')
const Router = require("@koa/router")
const router = new Router();
const sign = require('../services/sign')
const { js2xml } = require('../services/xml')

const getXmlValue = function (ctx, field) {
    if (!ctx.xmlData) return
    return ctx.xmlData[field][0]
}
const getOpenId = function (ctx) {
    if (ctx.openId) return ctx.openId
    let openId = ctx.openId = getXmlValue(ctx, "FromUserName")
    return openId
}
const xmlBuilder = new xml2js.Builder({ headless: true, cdata: true, rootName: "xml" });

//异步接收微信支付结果通知的回调地址
router.post('/pay/wxpay', async (ctx, next) => {
    console.log('/pay/wxpay', ctx.request.body)
    let xmlData = ctx.request.body.xml
    let newXml = {}
    Object.keys(xmlData).forEach(n => {
        newXml[n] = xmlData[n][0]
    })
    console.log('xmlData', newXml)
    if (newXml.return_code == 'SUCCESS') {
        let signRemote = newXml.sign
        delete newXml.sign
        if (signRemote == sign(newXml)) {
            console.log('ok')
            saveUnifiedorder(Object.assign({
                wx_openid: ctx.openid,
            }, newXml))
            let xml = js2xml({
                return_code: 'SUCCESS',
                return_msg: 'OK'
            })
            console.log('xml', xml)
            ctx.body = xml
        }
    }
})

router.post('/wx', async (ctx, next) => {
    // ctx.router available
    let body = ctx.request.body
    let xmlData = body.xml
    ctx.xmlData = xmlData
    ctx.msgType = getXmlValue(ctx, "MsgType")
    ctx.Content = getXmlValue(ctx, "Content")
    let openid = xmlData.FromUserName[0]
    // let openid = 'aaa'
    try {
        let result = await getToken(openid)
        if (result.length >= 1) {
            ctx.jwtToken = result[0].jwt
        } else {
            ctx.jwtToken = jwt.sign({ openid }, jwt_key)
            await addUser(openid, ctx.jwtToken)
        }
    } catch (error) {
        console.log(error)
    }

    console.log(`jwtToken:${ctx.jwtToken}`)
    console.log(`xml:${JSON.stringify(body.xml)}`)
    await next()
    console.log('res body', ctx.body)
    let myId = xmlData.ToUserName[0]
    let replyObject = {
        ToUserName: openid,
        FromUserName: myId,
        CreateTime: xmlData.CreateTime[0]
    }
    let ret = Object.assign(replyObject, ctx.body)

    ctx.set('Content-Type', 'text/xml');
    var xml = xmlBuilder.buildObject(ret)
    ctx.body = xml
});

// for wx config
const encrypt = (algorithm, content) => {
    let hash = createHash(algorithm)
    hash.update(content)
    return hash.digest('hex')
}
const sha1 = (content) => encrypt('sha1', content)

router.get('/wx', (ctx, next) => {
    let { echostr, timestamp, nonce, signature } = ctx.request.query
    let arr = [token, timestamp, nonce]
    arr.sort()
    let str = arr.join("")
    let shaStr = sha1(str)
    if (shaStr === signature) {
        ctx.body = echostr
    } else {
        console.log(arr)
        ctx.body = "wrong"
    }
});

module.exports = router