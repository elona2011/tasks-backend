const { port, token, staticPath } = require('./config')
const Koa = require('koa');
const xmlParser = require('koa-xml-body')
const Router = require("@koa/router")
const { createHash } = require('crypto');
const xml2js = require("xml2js")
const serve = require('koa-static');

const app = new Koa();
const router = new Router();

app.use(serve(staticPath))
app.context.getXmlValue = function (field) {
    if (!this.xmlData) return
    return this.xmlData[field][0]
}
app.context.getOpenId = function () {
    if (this.openId) return this.openId
    let openId = this.openId = this.getXmlValue("FromUserName")
    return openId
}
app.context.xmlBuilder = new xml2js.Builder({ headless: true, cdata: true, rootName: "xml" });

router.post('/wx', async (ctx, next) => {
    // ctx.router available
    let body = ctx.request.body
    let xmlData = body.xml
    ctx.xmlData = xmlData
    let type = ctx.getXmlValue("MsgType")
    ctx.msgType = type
    console.log(`xml:${JSON.stringify(body.xml)}`)
    await next()
    console.log('res body', ctx.body)
    let userOpenId = xmlData.FromUserName[0]
    let myId = xmlData.ToUserName[0]
    let replyObject = {
        ToUserName: userOpenId,
        FromUserName: myId,
        CreateTime: xmlData.CreateTime[0]
    }
    let ret = Object.assign(replyObject, ctx.body)
    // var responseObj = {
    //     "ToUserName": `${xmlData.FromUserName[0]}`,
    //     "FromUserName": `${xmlData.ToUserName[0]}`,
    //     "CreateTime":xmlData.CreateTime[0],
    //     "MsgType": `text`,
    //     "Content": `hi2 ${xmlData.Content[0]}`

    // };
    ctx.set('Content-Type', 'text/xml');
    // var builder = new xml2js.Builder({headless: true, cdata:true, rootName: "xml"});
    var xml = ctx.xmlBuilder.buildObject(ret)
    ctx.body = xml
});

app.use(xmlParser())
app.use(router.routes())
    .use(router.allowedMethods());

app.use(async function (ctx, next) {
    const str = `:method*****:url*****:body`
        .replace(':method', ctx.method)
        .replace(':url', ctx.url)
        .replace(':body', ctx.request.body)

    console.log(str);
    await next()
})

// response
app.use(async ctx => {
    ctx.body = {
        Content: '<a href="http://c.yanjie.me">点击显示关注、点赞任务</a>',
        MsgType: 'text'
    };
});

app.listen(port, function () {
    console.log("koa listen in 80")
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