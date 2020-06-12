const { port, token, staticPath } = require('./config')
const Koa = require('koa');
const xmlParser = require('koa-xml-body')
const serve = require('koa-static');
const apiRouter = require('./routes/api')
const wxRouter = require('./routes/wx')
const publish = require('./routes/publish')
const { init } = require('./sql')
const response = require('./middleware/response')
const bodyParser = require('koa-bodyparser');

init()
const app = new Koa();

app.use(serve(staticPath))
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

app.use(response);

app.listen(port, function () {
    console.log("koa listen in 80")
});

