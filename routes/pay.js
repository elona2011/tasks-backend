const Router = require("@koa/router")
const { getUserPay, getUserMoney, getUserPayDetail } = require('../sql/pay')
const { getValueByOpenid } = require('../sql/account')
const setOpenid = require('../middleware/setOpenid')
const { userPay, unifiedorder } = require('../services/pay')
const { mch_appid,mchid } = require('../config')
const { getOk, getRes } = require('../returnCode')
const { sign } = require('../services/sign')
const { xml2js } = require('../services/xml')

const router = new Router({ prefix: '/pay' });

router.use(setOpenid)

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
    if (ctx.request.body.money_pay < 30) {
        return ctx.body = getRes('moneySmaller')
    }
    const moneyObj = await getUserMoney({
        wx_openid: ctx.openid,
    })
    if (moneyObj.code != 0) {
        return ctx.body = getRes('openidNotFound')
    } else if (ctx.request.body.money_pay > moneyObj.result.money) {
        return ctx.body = getRes('moneyNotEnough')
    }
    await userPay({
        amount: ctx.request.body.money_pay,
        openid: moneyObj.result.wx_openid_new,
        desc: "工作任务奖励"
    }).then(async res => {
        console.log(res)
        if (res.status == 200) {
            let obj = xml2js(res.data)
            ctx.body = await getUserPay(Object.assign({
                wx_openid: ctx.openid,
                money_pay: ctx.request.body.money_pay,
                wx_id: Math.random().toString(36).substring(2, 15)
            }, obj))
            console.log(ctx.body)
        }
    })
})

router.post('/unifiedorder', async (ctx, next) => {
    console.log('/unifiedorder', ctx.request.body)
    let r = await getValueByOpenid(ctx.openid,'wx_openid_new')
    await unifiedorder({
        total_fee: ctx.request.body.money,
        spbill_create_ip: ctx.req.connection.remoteAddress,
        openid: r.wx_openid_new,
    }).then(async res => {
        console.log(res)
        if (res.status == 200) {
            let obj = xml2js(res.data)
            console.log('obj', obj)
            if (obj.return_code == 'SUCCESS' && obj.result_code == 'SUCCESS') {
                let r = {
                    appid: mch_appid,
                    partnerid:mchid,
                    prepayid:obj.prepay_id,
                    package:"Sign=WXPay",
                    noncestr: obj.nonce_str,
                    timestamp: Math.floor(+new Date() / 1000) + "",
                }
                r.sign = sign(r)
                console.log('r', r)
                ctx.body = getOk(r)
            }
        }
    })
})

const getXmlValue = function (ctx, field) {
    if (!ctx.xmlData) return
    return ctx.xmlData[field][0]
}



module.exports = router
