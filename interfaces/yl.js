const axios = require('axios').default;
const { signYL } = require('../services/sign')
const { ylhost, yltoken } = require('../config')

function commonParams() {
    return {
        api_token: yltoken,
        timestamp: Math.floor(+new Date / 1000),
    }
}
module.exports = {
    prdList() {
        let data = commonParams()
        data.sign = signYL(data)
        axios({
            method: 'post',
            url: `http://${ylhost}/api/goods/list`,
            data,
        }).then(res => {
            console.log('res', res.data)
        })
    },
    dyAddTask(gid, addr, num) {
        let data = Object.assign(commonParams(), {
            gid,
            num,
            value1: addr
        })
        data.sign = signYL(data)
        console.log('dyAddTask', data)
        return axios({
            method: 'post',
            url: `http://${ylhost}/api/order`,
            data,
        }).then(res => {
            console.log('gid', gid, res.data)
            if (res.data.status === 0) {
                return res.data.id
            } else {
                throw new Error(res.data.message)
            }
        })
    },
    getTaskDetail(ids) {
        let data = Object.assign(commonParams(), {
            ids
        })
        data.sign = signYL(data)
        console.log('dyAddTask', data)
        return axios({
            method: 'post',
            url: `http://${ylhost}/api/order/query`,
            data,
        }).then(res => {
            console.log('getTaskDetail', res.data)
            if (res.data.status === 0) {
                return res.data.data
            } else {
                throw new Error(res.data.message)
            }
        })
    }
}
