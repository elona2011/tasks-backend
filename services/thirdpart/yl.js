const axios = require('axios').default;
const { ylhost, yltoken, signYL } = require('../sign')

module.exports = {
    prdList() {
        let data = {
            api_token: yltoken,
            timestamp: Math.floor(+new Date / 1000),
        }
        data.sign = signYL(data)
        axios({
            method: 'post',
            url: `http://${ylhost}/api/goods/list`,
            // headers: {
            //     'content-type': 'text/xml',
            // },
            data,
        }).then(res => {
            console.log('res', res)
        })
    }
}