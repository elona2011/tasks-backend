const axios = require('axios').default;
const { wxAppId, wxAppSecret } = require('../config')

module.exports = {
    accessToken(code) {
        return axios({
            method: 'get',
            url: `https://api.weixin.qq.com/sns/oauth2/access_token`,
            params: {
                appid: wxAppId,
                secret: wxAppSecret,
                code,
                grant_type: 'authorization_code'
            },
        }).then(res => {
            console.log('wx token response', res.data)
            if (res.data.access_token) {
                return res.data
            }
        })
    },
    getUserInfo(access_token,openid) {
        return axios({
            method: 'get',
            url: `https://api.weixin.qq.com/sns/userinfo`,
            params: {
                access_token,
                openid,
            },
        }).then(res => {
            console.log('wx getUserInfo response', res.data)
            if (res.data.unionid) {
                return res.data
            }
        })
    }
}
