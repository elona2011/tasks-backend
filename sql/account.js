const { sql_user, sql_password } = require('../config')
const mysql = require('mysql')
const { query, queryTestLengthOne, queryTestAffectedRows, tc } = require('./utils')
const { getOk, getRes } = require('../returnCode')

let pool = mysql.createPool({
    host: 'localhost',
    user: sql_user,
    password: sql_password,
    database: "mydb"
})

module.exports = {
    addUser: tc(async (wx_openid, jwt, access_token, wx_openid_new) => {
        let insertId, r = await query(`select wx_openid from mydb.table_user where wx_openid=?`, [wx_openid])
        if (r.length) {
            insertId = await queryTestAffectedRows(`update mydb.table_user set jwt=?,access_token=?,wx_openid_new=? where wx_openid=?`, [jwt, access_token, wx_openid_new, wx_openid])
        } else {
            insertId = await queryTestAffectedRows(`insert into mydb.table_user (wx_openid,jwt,access_token,wx_openid_new) values (?,?,?,?)`, [wx_openid, jwt, access_token, wx_openid_new])
        }
        return getOk(insertId)
    }),
    getValueByOpenid: tc(async (wx_openid, name) => {
        let r = await queryTestLengthOne(`select ${name} from table_user where wx_openid=?`, [wx_openid])
        return r
    }),
    getToken: tc(async (wx_openid) => {
        let r = await query(`select jwt from table_user where wx_openid=?`, [wx_openid])
        return r
        // return new Promise((res, rej) => {
        //     pool.query(`select jwt from table_user where wx_openid=?`, [wx_openid], function (error, results) {
        //         if (error) rej(error);
        //         res(results)
        //     });
        // })
    }),
    async verifyOpenid(wx_openid) {
        return new Promise((res, rej) => {
            pool.query(`select wx_openid from table_user where wx_openid=?`, [wx_openid], function (error, results) {
                if (error) rej(error);
                res(results)
            });
        })
    },
    async addDyAccount({ wx_openid, dy_name, dy_id }) {
        return new Promise((res, rej) => {
            pool.query(`update table_user set dy_name=?, dy_id=? where wx_openid=?`, [dy_name, dy_id, wx_openid], function (error, results) {
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