module.exports = {
    port: 3000,
    token: 'wtftoken',
    staticPath: '../frontend-vue/dist',
    websitePath: 'website',
    sql_user: 'root',
    sql_password: '123456',
    jwt_key: 'abcdef',
    hostname: 'http://xxx',
    img_dir: '/website',
    getRes(name) {
        const r = {
            openidNotFound: 1,
            taskIsOut: 2,
            taskNotFound: 3,
            userNotFound: 4,
            moneyLarger: 5,
            moneyPayFail: 6,
            moneySmaller: 7,
            noFile: 20,
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
    AppSecret: 'xxx',
    mch_appid: 'xxx',
    mchid: 'xxx',
    seckey: 'xxx',
    cert: '../apiclient_cert.p12'
}
