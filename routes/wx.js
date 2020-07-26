const {
    createHash
} = require('crypto');
const jwt = require('jsonwebtoken')
const {
    jwt_key,
    token
} = require('../config')
const {
    addUser,
    getToken
} = require('../sql/account')
const {
    saveUnifiedorder
} = require('../sql/pay')
const Router = require("@koa/router")
const router = new Router();
const {
    sign
} = require('../services/sign')
const {
    js2xml,
    js2xml2,
    xml2js
} = require('../services/xml')
const {accessToken,getUserInfo} = require('../interfaces/wx')

//异步接收微信支付结果通知的回调地址
router.post('/pay/wxpay', async (ctx) => {
    console.log('/pay/wxpay', ctx.request.body)
    let xmlData = xml2js(ctx.request.body)
    console.log('xmlData', xmlData)
    if (xmlData.return_code == 'SUCCESS') {
        let signRemote = xmlData.sign
        delete xmlData.sign
        if (signRemote == sign(xmlData)) {
            console.log('ok')
            saveUnifiedorder(xmlData)
            let xml = js2xml({
                return_code: 'SUCCESS',
                return_msg: 'OK'
            })
            console.log('xml', xml)
            ctx.body = xml
        }
    }
})

router.get('/wx/access_token', async ctx => {
    let r = await accessToken(ctx.request.query.code)
    let rr=await getUserInfo(r.access_token,r.openid)
    let result = await getToken(rr.unionid)
    if(result.length){
        ctx.jwtToken = result[0].jwt
    }else{
        ctx.jwtToken = jwt.sign({
            unionid:r.unionid
        }, jwt_key)
        await addUser(r.unionid, ctx.jwtToken,r.access_token)
    }
    ctx.body = {jwt:ctx.jwtToken}
})

//公众号
router.post('/wx', async (ctx, next) => {
    // ctx.router available
    let body = ctx.request.body
    let xmlData = xml2js(body)
    ctx.xmlData = xmlData
    console.log('xmlData', xmlData)
    // ctx.msgType = getXmlValue(ctx, "MsgType")
    ctx.Event = xmlData.Event
    ctx.Content = xmlData.EventKey || xmlData.Content
    let openid = xmlData.FromUserName
    // let openid = 'aaa'
    try {
        let result = await getToken(openid)
        if (result.length >= 1) {
            ctx.jwtToken = result[0].jwt
        } else {
            ctx.jwtToken = jwt.sign({
                openid
            }, jwt_key)
            await addUser(openid, ctx.jwtToken)
        }
    } catch (error) {
        console.log(error)
    }

    console.log(`jwtToken:${ctx.jwtToken}`)
    await next()
    console.log('res body', ctx.body)
    let myId = xmlData.ToUserName
    let replyObject = {
        ToUserName: {
            '_cdata': openid
        },
        FromUserName: {
            '_cdata': myId
        },
        CreateTime: xmlData.CreateTime
    }
    let ret = Object.assign(replyObject, ctx.body)

    ctx.set('Content-Type', 'text/xml');
    console.log('ret', js2xml2(ret))
    ctx.body = js2xml2({
        xml: ret
    })
});

// for wx config
const encrypt = (algorithm, content) => {
    let hash = createHash(algorithm)
    hash.update(content)
    return hash.digest('hex')
}
const sha1 = (content) => encrypt('sha1', content)

router.get('/wx', (ctx) => {
    let {
        echostr,
        timestamp,
        nonce,
        signature
    } = ctx.request.query
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