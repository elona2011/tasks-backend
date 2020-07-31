const axios = require('axios').default;
const { signYL } = require('../sign')
const { ylhost, yltoken } = require('../../config')

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
            console.log('res', res.data)
        })
    },
    dyAddTask(gid, addr, num) {
        let data = {
            api_token: yltoken,
            timestamp: Math.floor(+new Date / 1000),
            gid,
            num,
            value1: addr
        }
        data.sign = signYL(data)
        console.log('dyAddTask', data)
        axios({
            method: 'post',
            url: `http://${ylhost}/api/order`,
            // headers: {
            //     'content-type': 'text/xml',
            // },
            data,
        }).then(res => {
            console.log('gid', gid, res.data)
        })
    },
}