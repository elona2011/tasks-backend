const Router = require("@koa/router")
const { addPublish, publishMy, getPublishById, editPublishTask, publishTaskView, publishCheck } = require('../sql/publish')
const setOpenid = require('../middleware/setOpenid')
const fs = require('fs')
const path = require('path')
const { img_dir } = require('../config')

const router = new Router({ prefix: '/api' });

router.use(setOpenid)

router.post('/publish', async (ctx, next) => {
    console.log('/publish', ctx.request.body)
    if (ctx.request.body.videoUrl) {
        let url = ctx.request.body.videoUrl.replace(/[\u{10000}-\u{10FFFF}]/gu, '')
        await addPublish({
            wx_openid: ctx.openid,
            url,
            follow_num: ctx.request.body.follow,
            follow_price: ctx.request.body.followPrice,
            comment_num: ctx.request.body.comment,
            comment_price: ctx.request.body.commentPrice,
            thumb_num: ctx.request.body.thumb,
            thumb_price: ctx.request.body.thumbPrice,
        })
    } else {
        const file = ctx.request.files.imgCode;
        if (!file) {
            return ctx.body = getRes('noFile')
        }
        const reader = fs.createReadStream(file.path);
        const imgName = Math.random().toString() + '.jpg'
        const stream = fs.createWriteStream(path.join(img_dir, imgName));
        stream.on('finish', () => {
            console.log('finish')
            let img64 = fs.readFileSync(stream.path, 'base64')
            console.log('size', img64.length)
            // ocrTest(img64)
        })
        reader.pipe(stream);
        console.log('uploading %s -> %s', file.name, stream.path);
        await addPublish({
            wx_openid: ctx.openid,
            video_name: ctx.request.body.video_name,
            img_code: stream.path,
            follow_num: ctx.request.body.follow,
            follow_price: ctx.request.body.followPrice,
            comment_num: ctx.request.body.comment,
            comment_price: ctx.request.body.commentPrice,
            thumb_num: ctx.request.body.thumb,
            thumb_price: ctx.request.body.thumbPrice,
        })
    }
    ctx.body = {
        code: 0,
        result: 0,
    }
})

router.post('/publishMy', async (ctx, next) => {
    console.log('/publishMy', ctx.request.body)
    let result = await publishMy({
        wx_openid: ctx.openid,
    })
    ctx.body = {
        code: 0,
        result,
    }
})

router.post('/getPublishById', async (ctx, next) => {
    console.log('/getPublishById', ctx.request.body)
    let result = await getPublishById({
        id: ctx.request.body.id,
        wx_openid: ctx.openid,
    })
    ctx.body = {
        code: 0,
        result: result.length ? result[0] : null,
    }
})

router.post('/editPublishTask', async (ctx, next) => {
    console.log('/editPublishTask', ctx.request.body)
    let result = await editPublishTask({
        id: ctx.request.body.id,
        state: ctx.request.body.state,
        wx_openid: ctx.openid,
    })
    ctx.body = {
        code: 0,
        result: null,
    }
})

router.post('/publishTaskView', async (ctx, next) => {
    console.log('/publishTaskView', ctx.request.body)
    let result = await publishTaskView({
        id: ctx.request.body.id,
        wx_openid: ctx.openid,
    })
    ctx.body = {
        code: 0,
        result,
    }
})

router.post('/publishCheck', async (ctx, next) => {
    console.log('/publishCheck', ctx.request.body)
    let result = await publishCheck({
        id: ctx.request.body.id,
        pass: ctx.request.body.pass,
        wx_openid_publish: ctx.openid,
    })
    ctx.body = {
        code: 0,
        result,
    }
})

router.post('/publishPay', async (ctx, next) => {
    console.log('/publishPay', ctx.request.body)
    let result = await publishPay({
        id: ctx.request.body.id,
        state: ctx.request.body.state,
        wx_openid: ctx.openid,
    })
    ctx.body = {
        code: 0,
        result: null,
    }
})

module.exports = router
