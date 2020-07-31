const Router = require("@koa/router")
const { addPublish, publishMy, getPublishById, editPublishTask, publishTaskView, publishCheck } = require('../sql/publish')
const setOpenid = require('../middleware/setOpenid')
const fs = require('fs')
const path = require('path')
const { img_dir } = require('../config')
const { getOk, getRes } = require('../returnCode')
const { dyAddTask } = require('../services/thirdpart/yl')
const { getPureUrl, getVideoId } = require('../services/dy')

const router = new Router({ prefix: '/api' });

router.use(setOpenid)
const config = {
    follow: [{ id: '1090629', min: 50 }],
    thumb: [{ id: '1042830', min: 10 }],
    comment: [{ id: '1047669', min: 10 }]
}
const followId = config.follow[0].id
const thumbId = config.thumb[0].id
const commentId = config.comment[0].id
const getSplitNum = (totalNum, type) => {
    const min = config[type][0].min
    const remainNum = 10 //留给自己的任务
    let remoteNum = 0, localNum = totalNum
    if (totalNum >= min) {
        remoteNum = (totalNum - remainNum < min) ? min : (totalNum - remainNum);
        localNum = totalNum - remoteNum
    }
    return [localNum, remoteNum]
}
router.post('/publish', async (ctx, next) => {
    console.log('/publish', ctx.request.body)
    if (ctx.request.body.type == 'dy') {
        let url = ctx.request.body.videoUrl.replace(/[\u{10000}-\u{10FFFF}]/gu, '')
        let follow_num = ctx.request.body.follow
        let comment_num = ctx.request.body.comment
        let thumb_num = ctx.request.body.thumb
        let pureUrl = getPureUrl(url)
        if (!pureUrl) {
            return getRes('UrlError')
        }
        let followNumNew = getSplitNum(follow_num, 'follow')
        let commentNumNew = getSplitNum(comment_num, 'comment')
        let thumbNumNew = getSplitNum(thumb_num, 'thumb')
        if (commentNumNew[1]) {
            getVideoId(pureUrl).then(videoId => {
                console.log('videoId', videoId)
                commentNumNew[1] && dyAddTask(commentId, videoId, commentNumNew[1])
            })
        }

        followNumNew[1] && dyAddTask(followId, pureUrl, followNumNew[1])
        thumbNumNew[1] && dyAddTask(thumbId, pureUrl, thumbNumNew[1])

        if (followNumNew[0] || commentNumNew[0] || thumbNumNew[0]) {
            ctx.body = await addPublish({
                wx_openid: ctx.openid,
                task_dywx: ctx.request.body.type,
                url,
                follow_num: followNumNew[0],
                follow_price: ctx.request.body.followPrice,
                comment_num: ctx.request.body.comment,
                comment_price: ctx.request.body.commentPrice,
                thumb_num: ctx.request.body.thumb,
                thumb_price: ctx.request.body.thumbPrice,
            })
        } else {
            ctx.body = getOk({})
        }
    } else if (ctx.request.body.type == 'wx') {
        const file = ctx.request.files.imgCode;
        if (!file) {
            return ctx.body = getRes('noFile')
        }
        const reader = fs.createReadStream(file.path);
        const imgName = Math.random().toString() + '.jpg'
        let img_path = path.join(img_dir, imgName)
        console.log('img_path', img_path)
        const stream = fs.createWriteStream(img_path);
        stream.on('finish', () => {
            console.log('finish')
            let img64 = fs.readFileSync(stream.path, 'base64')
            console.log('size', img64.length)
            // ocrTest(img64)
        })
        reader.pipe(stream);
        console.log('uploading %s -> %s', file.name, stream.path);
        ctx.body = await addPublish({
            wx_openid: ctx.openid,
            task_dywx: ctx.request.body.type,
            video_name: ctx.request.body.videoName,
            qr_code: '/img/' + imgName,
            follow_num: ctx.request.body.follow,
            follow_price: ctx.request.body.followPrice,
            comment_num: ctx.request.body.comment,
            comment_price: ctx.request.body.commentPrice,
            thumb_num: ctx.request.body.thumb,
            thumb_price: ctx.request.body.thumbPrice,
        })
    } else {
        ctx.body = getRes('typeErr')
    }
})

router.post('/publishMy', async (ctx, next) => {
    console.log('/publishMy', ctx.request.body)
    ctx.body = await publishMy({
        wx_openid: ctx.openid,
    })
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
    ctx.body = await publishCheck({
        id: ctx.request.body.id,
        pass: ctx.request.body.pass,
        wx_openid_publish: ctx.openid,
    })
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
