module.exports = {
    port: 3000,
    token: 'wtftoken',
    staticPath: '../frontend-vue/dist',
    sql_user: 'root',
    sql_password: '123456',
    jwt_key: 'abcdef',
    hostname: 'http://xxx',
    getRes(name) {
        const r = {
            openidNotFound: 1,
            taskIsOut: 2,
            taskNotFound: 3,
            userNotFound: 4,
            moneyLarger: 5,
            moneyPayFail: 6,
            moneySmaller: 7,
            dbFail: 100
        }
        return {
            code: r[name]
        }
    },
    getOk(result) {
        return {
            code: 0,
            result
        }
    },
    mch_appid: 'xxx',
    mchid: 'xxx',
    seckey: 'xxx',
    cert: '../apiclient_cert.p12'
}