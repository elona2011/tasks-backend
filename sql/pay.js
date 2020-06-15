const { sql_user, sql_password, getOk, getRes } = require('../config')
const mysql = require('mysql')

pool = mysql.createPool({
    host: 'localhost',
    user: sql_user,
    password: sql_password,
    database: "mydb"
})

module.exports = {
    async getUserMoney({ wx_openid }) {
        return new Promise((res, rej) => {
            pool.query(`select money,money_pay from table_user where wx_openid='${wx_openid}'`, function (error, results, fields) {
                if (error) rej(error);
                if (results.length) {
                    res(getOk(results[0]))
                } else {
                    res(getRes('taskNotFound'))
                }
            });
        })
    },
    async getUserPayDetail({ wx_openid, id }) {
        return new Promise((res, rej) => {
            pool.query(`select result_code from table_pay where id='${id}'`, function (error, results, fields) {
                if (error) rej(error);
                if (results.length) {
                    res(getOk(results[0]))
                } else {
                    res(getRes('taskNotFound'))
                }
            });
        })
    },
    async getUserPay(obj) {
        return new Promise((res, rej) => {
            pool.query(`select money from table_user where wx_openid='${obj.wx_openid}'`, function (error, results, fields) {
                if (error) rej(error);
                if (results.length) {
                    let { money } = results[0]

                    pool.query(`insert into table_pay (wx_openid,money_before,money,wx_id,return_code,return_msg,result_code,err_code,err_code_des,partner_trade_no,payment_no,payment_time)\
                                values ('${obj.wx_openid}',\
                                        '${money}',\
                                        '${obj.money_pay}',\
                                        '${obj.wx_id}',\
                                        '${obj.return_code || ''}',\
                                        '${obj.return_msg || ''}',\
                                        '${obj.result_code || ''}',\
                                        '${obj.err_code || ''}',\
                                        '${obj.err_code_des || ''}',\
                                        '${obj.partner_trade_no || ''}',\
                                        '${obj.payment_no || ''}',\
                                        '${obj.payment_time || ''}')`, function (error, results, fields) {
                        if (error) rej(error);
                        console.log(results)
                        if (results.affectedRows == 1) {
                            if (obj.return_code == 'SUCCESS' && obj.result_code == 'SUCCESS') {
                                pool.query(`update table_user set money=money-${obj.money_pay},money_pay=money_pay+${obj.money_pay} where wx_openid='${obj.wx_openid}'`, function (error, results, fields) {
                                    if (error) {
                                        console.log(error)
                                        return rej(error);
                                    }
                                    console.log('results', results)
                                });
                            }
                            res(getOk(results.insertId))
                        }
                        res(getRes('dbFail'))
                    });
                } else {
                    res(getRes('userNotFound'))
                }
            });
        })
    },
    async saveUnifiedorder(obj) {
        return new Promise((res, rej) => {
            pool.query(`select money from table_user where wx_openid='${obj.wx_openid}'`, function (error, results, fields) {
                if (error) rej(error);
                if (results.length) {
                    let { money } = results[0]

                    pool.query(`insert into table_pay (wx_openid,money_before,money,wx_id,return_code,return_msg,result_code,err_code,err_code_des,partner_trade_no,payment_no,payment_time)\
                                values ('${obj.wx_openid}',\
                                        '${money}',\
                                        '${obj.money_pay}',\
                                        '${obj.wx_id}',\
                                        '${obj.return_code || ''}',\
                                        '${obj.return_msg || ''}',\
                                        '${obj.result_code || ''}',\
                                        '${obj.err_code || ''}',\
                                        '${obj.err_code_des || ''}',\
                                        '${obj.partner_trade_no || ''}',\
                                        '${obj.payment_no || ''}',\
                                        '${obj.payment_time || ''}')`, function (error, results, fields) {
                        if (error) rej(error);
                        console.log(results)
                        if (results.affectedRows == 1) {
                            if (obj.return_code == 'SUCCESS' && obj.result_code == 'SUCCESS') {
                                pool.query(`update table_user set money=money-${obj.money_pay},money_pay=money_pay+${obj.money_pay} where wx_openid='${obj.wx_openid}'`, function (error, results, fields) {
                                    if (error) {
                                        console.log(error)
                                        return rej(error);
                                    }
                                    console.log('results', results)
                                });
                            }
                            res(getOk(results.insertId))
                        }
                        res(getRes('dbFail'))
                    });
                } else {
                    res(getRes('userNotFound'))
                }
            });
        })
    },
}