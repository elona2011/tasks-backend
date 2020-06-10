const Router = require("@koa/router")
const { verifyOpenid, addDyAccount } = require('../sql/account')
const { getNewTasks, getTask, startTask, mytasks, usertask, updatetask } = require('../sql/tasks')
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
    let result = await getNewTasks({ wx_openid: ctx.openid })
    ctx.body = {
        code: 0,
        result,
    }
})

router.post('/mytasks', async (ctx, next) => {
    console.log('/mytasks', ctx.request.body)
    let result = await mytasks({ wx_openid: ctx.openid })
    ctx.body = {
        code: 0,
        result,
    }
})

router.post('/gettask', async (ctx, next) => {
    console.log('/gettask', ctx.request.body)
    let result = await getTask(ctx.request.body.id)
    ctx.body = {
        code: 0,
        result: result.length ? result[0] : null,
    }
})

router.post('/starttask', async (ctx, next) => {
    console.log('/starttask', ctx.request.body)
    let result = await startTask({
        wx_openid: ctx.openid,
        id: ctx.request.body.id,
        task_type: ctx.request.body.task_type,
        task_state: ctx.request.body.task_state
    })
    ctx.body = {
        code: 0,
        result: result.length ? result[0].insertId : null,
    }
})

router.post('/usertask', async (ctx, next) => {
    console.log('/usertask', ctx.request.body)
    let result = await usertask({
        wx_openid: ctx.openid,
        id: ctx.request.body.id,
    })
    ctx.body = {
        code: 0,
        result: result.length ? result[0] : null,
    }
})

router.post('/updatetask', async (ctx, next) => {
    console.log('/updatetask', ctx.request.body)
    let result = await updatetask({
        wx_openid: ctx.openid,
        id: ctx.request.body.id,
        task_state: 2
    })
    ctx.body = {
        code: 0,
        result: result.length ? result[0] : null,
    }
})

module.exports = router
