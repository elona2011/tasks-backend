const response = async ctx => {
    switch (ctx.Content) {
        case 'publish':
            ctx.body = {
                Content: `<a href="http://p.wechat.ac.cn/home/#/publish/new/${ctx.jwtToken}">发布任务</a>`,
                MsgType: 'text'
            };
            break;
        case 'task':
            ctx.body = {
                Content: `<a href="http://p.wechat.ac.cn/home/#/user/new/${ctx.jwtToken}">点击做任务</a>`,
                MsgType: 'text'
            };
            break;
        case 'moneyIn':
            ctx.body = {
                Content: `<a href="http://p.wechat.ac.cn/home/#/publish/pay/${ctx.jwtToken}">点击充值</a>`,
                MsgType: 'text'
            };
            break;
        case 'moneyOut':
            ctx.body = {
                Content: `<a href="http://p.wechat.ac.cn/home/#/user/pay/${ctx.jwtToken}">点击提现</a>`,
                MsgType: 'text'
            };
            break;
    }
}

module.exports = response