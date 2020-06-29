const Router = require("@koa/router")
const { addDyAccount } = require('../sql/account')
const { newtasks, getTask, startTask, mytasks, usertask, updatetask } = require('../sql/tasks')
const setOpenid = require('../middleware/setOpenid')



const router = new Router({ prefix: '/api' });

router.use(setOpenid)

router.post('/filldyid', async (ctx, next) => {
    console.log('/filldyid', ctx.request.body)
    await addDyAccount({
        wx_openid: ctx.openid,
        dy_name: ctx.request.body.dy_name,
        dy_id: ctx.request.body.dy_id,
    })
    ctx.body = {
        code: 0,
        result: 0,
    }
})

router.post('/newtasks', async (ctx, next) => {
    console.log('/newtasks', ctx.request.body)
    ctx.body = await newtasks({ wx_openid: ctx.openid })
})

router.post('/mytasks', async (ctx, next) => {
    console.log('/mytasks', ctx.request.body)
    ctx.body = await mytasks({ wx_openid: ctx.openid })
})

router.post('/gettask', async (ctx, next) => {
    console.log('/gettask', ctx.request.body)
    ctx.body = await getTask(ctx.request.body.id)
})

router.post('/starttask', async (ctx, next) => {
    console.log('/starttask', ctx.request.body)
    ctx.body = await startTask({
        wx_openid: ctx.openid,
        id: ctx.request.body.id,
    })
})

router.post('/usertask', async (ctx, next) => {
    console.log('/usertask', ctx.request.body)
    ctx.body = await usertask({
        wx_openid: ctx.openid,
        id: ctx.request.body.id,
    })
})

router.post('/updatetask', async (ctx, next) => {
    console.log('/updatetask', ctx.request.body)
    ctx.body = await updatetask({
        wx_openid: ctx.openid,
        id: ctx.request.body.id,
        task_state: 2
    })
})

router.post('/upload', async (ctx, next) => {
    console.log('/upload', ctx.request.body)
    const file = ctx.request.files.file;
    const reader = fs.createReadStream(file.path);
    const stream = fs.createWriteStream(path.join(os.tmpdir(), Math.random().toString()));
    reader.pipe(stream);
    console.log('uploading %s -> %s', file.name, stream.path);
    ctx.body = {
        code: 0,
        result: 0,
    }
})

module.exports = router
