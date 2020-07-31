module.exports = {
    getRes(name) {
        const r = {
            openidNotFound: 1,
            taskIsOut: 2,
            taskNotFound: 3,
            userNotFound: 4,
            moneyLarger: 5,
            moneyPayFail: 6,
            moneySmaller: 7,
            moneyNotEnough: 8,
            taskNumNotEnough: 9,
            noFile: 20,
            typeErr: 40,
            UrlError: 50,
            dbFail: 100,
            unknown: 999
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
}