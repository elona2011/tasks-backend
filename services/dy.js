const axios = require('axios').default;

const getPureUrl = url => {
    let r = url.match(/https?:\/\/[0-9\./?=a-zA-Z_&]+/)
    let pureUrl = ''
    if (r.length) {
        pureUrl = r[0]
    }
    return pureUrl
}

module.exports = {
    getVideoId(url) {
        let pureUrl = getPureUrl(url)
        if (!pureUrl) throw new Error('url error')
        return axios({
            method: 'get',
            url: pureUrl,
        }).then(res => {
            let segs = res.request.path.split('/')
            if (segs.length === 5) {
                return segs[3]
            } else {
                return ''
            }
        })
    },
    getPureUrl
}