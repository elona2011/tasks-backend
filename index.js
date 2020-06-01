const Koa = require('koa');
const xmlParser = require('koa-xml-body')
const Router = require("@koa/router")
const {createHash}= require('crypto');

const app = new Koa();
const router = new Router();

router.get('/', (ctx, next) => {
    // ctx.router available
});

app.use(router.routes())
    .use(router.allowedMethods());
app.use(xmlParser())
// response
app.use(ctx => {
    ctx.body = 'Hello Koa';
});

app.listen(3000, function () {
    console.log("koa listen in 80")
});

// for wx config
const encrypt = (algorithm, content) => {
  let hash = createHash(algorithm)
  hash.update(content)
  return hash.digest('hex')
}
const sha1 = (content) => encrypt('sha1', content)
app.get('/wx', function(req, res) {
    let {echostr, timestamp, nonce, signature} = req.query
    let token="wtftoken"
    let arr = [token, timestamp, nonce]
    arr.sort()
    let str = arr.join("")
    let shaStr = sha1(str)
    if (shaStr === signature) {
        res.send(echostr)
        debugger
    } else {
        console.log(arr)
        res.send("wrong")
    }
});