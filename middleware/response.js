const response = async ctx => {
    if (ctx.Content == '发布') {
        ctx.body = {
            Content: `<a href="http://p.wechat.ac.cn/#/publish/${ctx.jwtToken}">发布任务</a>`,
            MsgType: 'text'
        };
    } else {
        ctx.body = {
            Content: `<a href="http://p.wechat.ac.cn/#/usertasksnew/${ctx.jwtToken}">点击做任务</a>`,
            MsgType: 'text'
        };
    }
}
module.exports = response