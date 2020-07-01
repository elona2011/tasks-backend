const { createHash } = require('crypto');
const { mch_appid, mchid, seckey, hostname } = require('../config')

module.exports = {
    sign(obj) {
        let r = ''
        Object.keys(obj).sort().forEach(n => {
            if (r) r += '&'
            r += n + '=' + obj[n]
        })
        r += '&key=' + seckey

        return createHash('md5').update(r).digest("hex").toUpperCase()
    },
    ['TC3-HMAC-SHA256']() {
        var Algorithm = "TC3-HMAC-SHA256"; // 签名算法，目前固定为 TC3-HMAC-SHA256
        var RequestTimestamp = Math.round(new Date().getTime() / 1000) + ""; // 请求时间戳，即请求头部的公共参数 X-TC-Timestamp 取值，取当前时间 UNIX 时间戳，精确到秒
        var t = new Date();
        var date = t.toISOString().substr(0, 10); // 计算 Date 日期   date = "2019-08-26"
        /**
         * Date 必须从时间戳 X-TC-Timestamp 计算得到，且时区为 UTC+0。
         * 如果加入系统本地时区信息，例如东八区，将导致白天和晚上调用成功，但是凌晨时调用必定失败。
         * 假设时间戳为 1551113065，在东八区的时间是 2019-02-26 00:44:25，但是计算得到的 Date 取 UTC+0 的日期应为 2019-02-25，而不是 2019-02-26。
         * Timestamp 必须是当前系统时间，且需确保系统时间和标准时间是同步的，如果相差超过五分钟则必定失败。
         * 如果长时间不和标准时间同步，可能导致运行一段时间后，请求必定失败，返回签名过期错误。
         */
        var CredentialScope = date + "/ocr/tc3_request";
        /**
         *  拼接 CredentialScope 凭证范围，格式为 Date/service/tc3_request ， 
         * service 为服务名，慧眼用 faceid ， OCR 文字识别用 ocr
         */

        // 将第一步拼接得到的 CanonicalRequest 再次进行哈希加密
        var HashedCanonicalRequest = crypto.createHash('sha256').update(CanonicalRequest).digest('hex');
        // 拼接
        var StringToSign = Algorithm + '\n' +
            RequestTimestamp + '\n' +
            CredentialScope + '\n' +
            HashedCanonicalRequest;
        console.log('2. 拼接待签名字符串' + StringToSign);
        console.log('\n');

        // 3. 计算签名
        var SecretKey = ""; // SecretKey, 需要替换为自己的
        var SecretDate = crypto.createHmac('sha256', "TC3" + SecretKey).update(date).digest();
        var SecretService = crypto.createHmac('sha256', SecretDate).update("ocr").digest();
        var SecretSigning = crypto.createHmac('sha256', SecretService).update("tc3_request").digest();
        var Signature = crypto.createHmac('sha256', SecretSigning).update(StringToSign).digest('hex');
        console.log('3. 计算签名' + Signature); // 当前计算为 23760169fd18522e0f4f317d4c3f2cf875de7038cc27f1ea5648e88bb5ebb1d9

    }
}