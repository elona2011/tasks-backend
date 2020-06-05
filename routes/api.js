const Router = require("@koa/router")
const jwt = require('jsonwebtoken')
const { addPublish } = require('../sql/publish')
const { jwt_key } = require('../config')
const { verifyOpenid, addDyAccount } = require('../sql/account')
const { getNewTasks, getTask, startTask, mytasks, usertask, updatetask } = require('../sql/tasks')

const router = new Router({ prefix: '/api' });

router.use(async (ctx, next) => {
    let decoded = jwt.verify(ctx.request.body.token, jwt_key)
    let result = await verifyOpenid(decoded.openid || decoded.userOpenId)
    console.log(result)
    if (result.length != 1) {
        throw new Error('openid not found')
    }
    ctx.openid = result[0].wx_openid

    await next()
})

router.post('/publish', async (ctx, next) => {
    console.log('/publish', ctx.request.body)
    await addPublish({
        wx_openid: ctx.openid,
        url: ctx.request.body.videoUrl,
        follow_num: ctx.request.body.follow,
        comment_num: ctx.request.body.comment,
        thumb_num: ctx.request.body.thumb,
    })
    ctx.body = {
        code: 0,
        result: 0,
    }
})

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
    let result = await getNewTasks()
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
        result: result.length == 2 ? result[1].insertId : null,
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
