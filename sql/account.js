const { sql_user, sql_password } = require('../config')
const mysql = require('mysql')

pool = mysql.createPool({
    host: 'localhost',
    user: sql_user,
    password: sql_password,
    database: "mydb"
})

module.exports = {
    async addUser(wx_openid, jwt) {
        return new Promise((res, rej) => {
            pool.query(`insert into table_user (wx_openid,jwt) values (?,?)`, [wx_openid, jwt], function (error, results, fields) {
                if (error) rej(error);
                res(results)
            });
        })
    },
    async getToken(wx_openid) {
        return new Promise((res, rej) => {
            pool.query(`select jwt from table_user where wx_openid=?`, [wx_openid], function (error, results, fields) {
                if (error) rej(error);
                res(results)
            });
        })
    },
    async verifyOpenid(wx_openid) {
        return new Promise((res, rej) => {
            pool.query(`select wx_openid from table_user where wx_openid=?`, [wx_openid], function (error, results, fields) {
                if (error) rej(error);
                res(results)
            });
        })
    },
    async addDyAccount({ wx_openid, dy_name, dy_id }) {
        return new Promise((res, rej) => {
            pool.query(`update table_user set dy_name=?, dy_id=? where wx_openid=?`, [dy_name, dy_id, wx_openid], function (error, results, fields) {
                if (error) rej(error);
                res(results)
            });
        })
    },
    async updateLoginTime({ wx_openid }) {
        return new Promise((res, rej) => {
            pool.query(`update table_user set login_num=login_num+1,last_login_time=CURRENT_TIMESTAMP where wx_openid=?`, [wx_openid], function (error, results, fields) {
                if (error) rej(error);
                res(results)
            });
        })
    },
}