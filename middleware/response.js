const response = async ctx => {
    if(ctx.Content=='发布'){
        ctx.body = {
            Content: `<a href="http://34.80.134.190/publish?t=${ctx.jwtToken}">点击显示关注、点赞任务</a>`,
            MsgType: 'text'
        };
    }else{
        ctx.body = {
            Content: `<a href="http://34.80.134.190?t=${ctx.jwtToken}">点击显示关注、点赞任务</a>`,
            MsgType: 'text'
        };
    }
}
module.exports = response