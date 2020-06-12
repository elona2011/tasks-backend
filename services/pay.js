const axios = require('axios').default;
const xml2js = require("xml2js")
const { createHash } = require('crypto');
const https = require('https')
const fs = require('fs')
const { mch_appid, mchid, seckey } = require('../config')

module.exports = ({ amount, partner_trade_no, openid, desc }) => {
    if (amount < 100) {
        return console.log('amount<100,return')
    }

    const xmlBuilder = new xml2js.Builder({ headless: true, cdata: true, rootName: "xml" });

    let obj = {
        mch_appid,
        mchid,
        nonce_str: Math.random().toString(36).substring(7),
        partner_trade_no,
        openid,
        check_name: 'NO_CHECK',
        amount: amount,
        desc,
    }
    let r = ''
    Object.keys(obj).sort().forEach(n => {
        if (r) r += '&'
        r += n + '=' + obj[n]
    })
    r += '&key=' + seckey

    let sign = createHash('md5').update(r).digest("hex").toUpperCase()
    obj.sign = sign
    let xml = xmlBuilder.buildObject(obj)
    console.log('xml', xml)
    
    return axios({
        method: 'post',
        url: 'https://api.mch.weixin.qq.com/mmpaymkttransfers/promotion/transfers',
        headers: {
            'content-type': 'text/xml',
        },
        data: xml,
        httpsAgent: new https.Agent({
            pfx: fs.readFileSync('../apiclient_cert.p12'),
            passphrase: mchid
        })
    })
}
