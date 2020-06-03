const response = async ctx => {
    if(ctx.Content=='发布'){
        ctx.body = {
            Content: `<a href="http://34.80.134.190/#/publish/${ctx.jwtToken}">发布关注、点赞、评论任务</a>`,
            MsgType: 'text'
        };
    }else{
        ctx.body = {
            Content: `<a href="http://34.80.134.190/#/tasks/${ctx.jwtToken}">点击显示关注、点赞、评论任务</a>`,
            MsgType: 'text'
        };
    }
}
module.exports = response