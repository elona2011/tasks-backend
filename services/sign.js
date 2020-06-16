const { createHash } = require('crypto');
const { mch_appid, mchid, seckey, hostname } = require('../config')

module.exports = (obj) => {
    let r = ''
    Object.keys(obj).sort().forEach(n => {
        if (r) r += '&'
        r += n + '=' + obj[n]
    })
    r += '&key=' + seckey

    return createHash('md5').update(r).digest("hex").toUpperCase()
}