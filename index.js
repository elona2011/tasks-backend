const { port, token, staticPath } = require('./config')
const Koa = require('koa');
const xmlParser = require('koa-xml-body')
const serve = require('koa-static');
const apiRouter = require('./routes/api')
const payRouter = require('./routes/pay')
const wxRouter = require('./routes/wx')
const publish = require('./routes/publish')
const { initSql } = require('./sql')
const response = require('./middleware/response')
const bodyParser = require('koa-bodyparser');
const mount = require('koa-mount');
const { setMenu } = require('./services/wx')

setMenu()
initSql()
const app = new Koa();

// app.use(serve(staticPath))
app.use(mount('/home', serve(staticPath)))
app.use(mount('/', serve('website')))
app.use(xmlParser())
app.use(bodyParser({
    enableTypes: ['json', 'xml']
}))

app.use(async function (ctx, next) {
    const str = `:method*****:url*****:body`
        .replace(':method', ctx.method)
        .replace(':url', ctx.url)
        .replace(':body', ctx.request.body)

    console.log(str);
    await next()
})
app.use(apiRouter.routes())
app.use(apiRouter.allowedMethods());
app.use(publish.routes())
app.use(publish.allowedMethods());
app.use(wxRouter.routes())
app.use(wxRouter.allowedMethods());
app.use(payRouter.routes())
app.use(payRouter.allowedMethods());

app.use(response);

app.listen(port, function () {
    console.log("koa listen in 80")
});

