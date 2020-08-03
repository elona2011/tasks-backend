const { port, websitePath, staticPath, img_dir } = require('./config')
const Koa = require('koa');
const compress = require('koa-compress')
const koaBody = require('koa-body');
const serve = require('koa-static');
const apiRouter = require('./routes/api')
const payRouter = require('./routes/pay')
const wxRouter = require('./routes/wx')
const publish = require('./routes/publish')
const dy = require('./routes/dy')
const { initSql, routineCheck } = require('./sql')
const response = require('./middleware/response')
const mount = require('koa-mount');
const { setMenu } = require('./services/wx')
const { prdList } = require('./interfaces/yl')
// const {ocrTest} = require('./services/ocr')

// ocrTest()
// setMenu()
initSql()
routineCheck()
const app = new Koa();

app.use(compress({
    threshold: 2048,
    // gzip: {
    //     flush: require('zlib').Z_SYNC_FLUSH
    // },
    // deflate: {
    //     flush: require('zlib').Z_SYNC_FLUSH,
    // },
}))
// app.use(serve(staticPath))
app.use(mount('/home', serve(staticPath)))
app.use(mount('/', serve(websitePath)))
app.use(mount('/img', serve(img_dir)))
app.use(koaBody({ multipart: true }))

app.use(async function (ctx, next) {
    const str = `:method*****:url*****:body`
        .replace(':method', ctx.method)
        .replace(':url', ctx.url)
        .replace(':body', JSON.stringify(ctx.request.body))

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
app.use(dy.routes())
app.use(dy.allowedMethods());

app.use(response);

app.listen(port, function () {
    console.log("koa listen in 80")
});

// prdList()
