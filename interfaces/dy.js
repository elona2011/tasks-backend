const axios = require('axios').default;
const { dyClientKey, dyClientSecret } = require('../config')

module.exports = {
    accessToken(code) {
        return axios({
            method: 'get',
            url: `https://open.douyin.com/oauth/access_token`,
            params: {
                client_key: dyClientKey,
                client_secret: dyClientSecret,
                code,
                grant_type: 'authorization_code'
            },
        }).then(res => {
            console.log('dy token response', res.data)
            return res.data
        })
    }
}
