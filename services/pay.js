const axios = require('axios').default;
const xml2js = require("xml2js")
const https = require('https')
const fs = require('fs')
const { mch_appid, mchid, hostname } = require('../config')
const sign = require('./sign')

module.exports = {
    userPay({ amount, openid, desc }) {
        const xmlBuilder = new xml2js.Builder({ headless: true, cdata: true, rootName: "xml" });

        let obj = {
            mch_appid,
            mchid,
            nonce_str: Math.random().toString(36).substring(2, 15),
            partner_trade_no: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            openid,
            check_name: 'NO_CHECK',
            amount: amount,
            desc,
        }
        sign(obj)
        
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
    },
    unifiedorder({ total_fee, spbill_create_ip, openid }) {
        const xmlBuilder = new xml2js.Builder({ headless: true, cdata: true, rootName: "xml" });

        let obj = {
            appid: mch_appid,
            mch_id: mchid,
            device_info: 'WEB',
            nonce_str: Math.random().toString(36).substring(2, 15),
            body: '测试页码-测试商品',
            out_trade_no: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
            total_fee,
            spbill_create_ip,
            notify_url: `${hostname}/wxpay`,
            trade_type: 'JSAPI',
            openid,
        }
        sign(obj)
      
        let xml = xmlBuilder.buildObject(obj)
        console.log('xml', xml)

        return axios({
            method: 'post',
            url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
            headers: {
                'content-type': 'text/xml',
            },
            data: xml,
            // httpsAgent: new https.Agent({
            //     pfx: fs.readFileSync('../apiclient_cert.p12'),
            //     passphrase: mchid
            // })
        })
    }
} 