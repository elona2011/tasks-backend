const { sql_user, sql_password } = require('../config')
const mysql = require('mysql')
const { query, queryTestLength, queryTestAffectedRows, tc } = require('./utils')
const { getOk, getRes } = require('../returnCode')

let pool = mysql.createPool({
    host: 'localhost',
    user: sql_user,
    password: sql_password,
    database: "mydb"
})

module.exports = {
    addUser: tc(async (wx_openid, jwt, access_token) => {
        let insertId = await queryTestAffectedRows(`insert into table_user (wx_openid,jwt,access_token) values (?,?,?)`, [wx_openid, jwt, access_token])
        return getOk(insertId)
    }),
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