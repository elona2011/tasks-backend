module.exports = {
    port: 3000,
    token: 'wtftoken',
    staticPath: '../frontend-vue/dist',
    sql_user: 'root',
    sql_password: '123456',
    jwt_key: 'abcdef',
    r: {
        ok(result) {
            return {
                code: 0,
                result
            }
        },
        openidNotFound: {
            code: 1,
            // result: 'openid not found'
        },
        taskIsOut: {
            code: 2,
            // result: 'task is out'
        },
        taskNotFound: {
            code: 3,
            // result: 'task not found'
        },
        userNotFound: {
            code: 4,
            // result: 'user not found'
        },
        moneyLarger: {
            code: 5,
            // result: 'user not found'
        },
        moneyPayFail: {
            code: 6,
            // result: 'user not found'
        },
        dbFail: {
            code: 7,
            // result: 'user not found'
        }
    },
    mch_appid: 'xxx',
    mchid: 'xxx',
    seckey: 'xxx'
}