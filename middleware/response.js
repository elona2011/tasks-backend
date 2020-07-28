const response = async ctx => {
    switch(ctx.Event){
        case 'subscribe':
            ctx.body = {
                MsgType: { '_cdata': 'image' },
                Image: {
                    MediaId: {
                        "_cdata": '3rowYwTyBvMrdKos-fLkTp0E1SA1DVcJq7VgfFKgAxK62MC75QGL6xmV8dSHEfg_'
                    }
                }
            };
            return
    }
    switch (ctx.Content) {
        case 'pppppppp':
            ctx.body = {
                Content: { '_cdata': `<a href="http://p.wechat.ac.cn/home/#/publish/newtype/${ctx.jwtToken}">点击发布任务📋</a>` },
                MsgType: { '_cdata': 'text' }
            };
            break;
        case 'task':
            ctx.body = {
                Content: { '_cdata': `<a href="http://p.wechat.ac.cn/home/#/user/new/${ctx.jwtToken}">点击做任务🔧</a>` },
                MsgType: { '_cdata': 'text' }
            };
            break;
        case 'moneyIn':
            ctx.body = {
                Content: { '_cdata': `<a href="http://p.wechat.ac.cn/home/#/publish/pay/${ctx.jwtToken}">点击充值💰</a>` },
                MsgType: {
                    '_cdata': 'text'
                }
            };
            break;
        case 'moneyOut':
            ctx.body = {
                Content: { '_cdata': `<a href="http://p.wechat.ac.cn/home/#/user/pay/${ctx.jwtToken}">点击提现💹</a>` },
                MsgType: {
                    '_cdata': 'text'
                }
            };
            break;
        case 'qrcode':
            ctx.body = {
                MsgType: { '_cdata': 'image' },
                Image: {
                    MediaId: {
                        "_cdata": '3rowYwTyBvMrdKos-fLkTp0E1SA1DVcJq7VgfFKgAxK62MC75QGL6xmV8dSHEfg_'
                    }
                }
            };
            break;
        default:
            ctx.body = {
                Content: { '_cdata': `谢谢你关注我` },
                MsgType: { '_cdata': 'text' }
            };
            break;
    }
}

module.exports = response