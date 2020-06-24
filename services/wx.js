const axios = require('axios').default;
const { mch_appid, AppSecret } = require('../config')

const getAccessToken = () => {
    return axios({
        method: 'get',
        url: 'https://api.weixin.qq.com/cgi-bin/token',
        params: {
            grant_type: 'client_credential',
            appid: mch_appid,
            secret: AppSecret
        },
    }).then(res => {
        console.log('getAccessToken', res)
        return res.data.access_token
    })
}

const setMenu = async () => {
    const accessToken = await getAccessToken()
    axios({
        method: 'post',
        url: 'https://api.weixin.qq.com/cgi-bin/menu/create',
        params: {
            access_token: accessToken
        },
        data: {
            "button": [
                {
                    "type": "click",
                    "name": "发布任务👍",
                    "key": "publish"
                },
                {
                    "type": "click",
                    "name": "做任务🔧",
                    "key": "task"
                }, {
                    "name": "菜单",
                    "sub_button": [
                        {
                            "type": "click",
                            "name": "充值💰",
                            "key": "moneyIn"
                        },
                        {
                            "type": "click",
                            "name": "提现💹",
                            "key": "moneyOut"
                        }]
                }]
        }
    }).then(res => {
        console.log(res)
    })
}

module.exports = {
    getAccessToken,
    setMenu
}
