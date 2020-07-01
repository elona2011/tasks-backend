module.exports={
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
}