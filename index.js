const { port, token, staticPath } = require('./config')
const Koa = require('koa');
const xmlParser = require('koa-xml-body')
const { createHash } = require('crypto');
const serve = require('koa-static');
const router = require('./api')
const { init } = require('./sql')
const response = require('./middleware/response')

init()
const app = new Koa();

app.use(serve(staticPath))
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

app.use(response);

app.listen(port, function () {
    console.log("koa listen in 80")
});

