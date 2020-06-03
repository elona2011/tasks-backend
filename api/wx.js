const xml2js = require("xml2js")
const jwt = require('jsonwebtoken')
const { jwt_key } = require('../config')

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

module.exports = router => {
    router.post('/wx', async (ctx, next) => {
        // ctx.router available
        let body = ctx.request.body
        let xmlData = body.xml
        ctx.xmlData = xmlData
        ctx.msgType = ctx.getXmlValue("MsgType")
        ctx.Content = ctx.getXmlValue("Content")
        let userOpenId = xmlData.FromUserName[0]
        ctx.jwtToken = jwt.sign({ userOpenId }, jwt_key)
        console.log(`jwtToken:${ctx.jwtToken}`)
        console.log(`xml:${JSON.stringify(body.xml)}`)
        await next()
        console.log('res body', ctx.body)
        let myId = xmlData.ToUserName[0]
        let replyObject = {
            ToUserName: userOpenId,
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

    // router.get('/wx', (ctx, next) => {
    //     let { echostr, timestamp, nonce, signature } = ctx.request.query
    //     let arr = [token, timestamp, nonce]
    //     arr.sort()
    //     let str = arr.join("")
    //     let shaStr = sha1(str)
    //     if (shaStr === signature) {
    //         ctx.body = echostr
    //         debugger
    //     } else {
    //         console.log(arr)
    //         ctx.body = "wrong"
    //     }
    // });
}
