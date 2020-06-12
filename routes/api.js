const Router = require("@koa/router")
const { verifyOpenid, addDyAccount } = require('../sql/account')
const { newtasks, getTask, startTask, mytasks, usertask, updatetask, getUserMoney, getUserPay, getUserPayDetail } = require('../sql/tasks')
const setOpenid = require('../middleware/setOpenid')
const { r } = require('../config')
const pay = require('../services/pay')
const convert = require('xml-js')

function fixXmlObj(obj) {
    let r = {}
    Object.keys(obj.xml).forEach(n => {
        r[n] = obj.xml[n]._cdata
    })
    return r
}

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

router.post('/getUserMoney', async (ctx, next) => {
    console.log('/getUserMoney', ctx.request.body)
    ctx.body = await getUserMoney({
        wx_openid: ctx.openid,
    })
})
router.post('/getUserPayDetail', async (ctx, next) => {
    console.log('/getUserPayDetail', ctx.request.body)
    ctx.body = await getUserPayDetail({
        wx_openid: ctx.openid,
        id: ctx.request.body.id
    })
})

router.post('/getUserPay', async (ctx, next) => {
    console.log('/getUserPay', ctx.request.body)
    if (ctx.request.body.money_pay > 500) {
        return ctx.body = r.moneyLarger
    }
    let randomStr = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
    console.log(randomStr)
    await pay({
        amount: ctx.request.body.money_pay,
        partner_trade_no: randomStr,
        openid: ctx.openid,
        desc: "评赞任务奖励"
    }).then(async res => {
        console.log(res)
        if (res.status == 200) {
            let obj = fixXmlObj(convert.xml2js(res.data, { compact: true }))
            ctx.body = await getUserPay(Object.assign({
                wx_openid: ctx.openid,
                money_pay: ctx.request.body.money_pay,
                wx_id: randomStr
            }, obj))
            console.log(ctx.body)
        }
    })
})

module.exports = router
