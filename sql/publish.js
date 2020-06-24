const { sql_user, sql_password } = require('../config')
const mysql = require('mysql')

pool = mysql.createPool({
    host: 'localhost',
    user: sql_user,
    password: sql_password,
    database: "mydb"
})

module.exports = {
    async addPublish(obj) {
        return new Promise((res, rej) => {
            let money = obj.follow_price * obj.follow_num + obj.thumb_price * obj.thumb_num + obj.comment_price * obj.comment_num
            pool.query(`insert into table_publish (wx_openid,money,url,follow_num,follow_money,thumb_num,thumb_money,comment_num,comment_money) \
                        values ('${obj.wx_openid}','${money}','${obj.url}','${obj.follow_num}','${obj.follow_price}',\
                        '${obj.thumb_num}','${obj.thumb_price}','${obj.comment_num}','${obj.comment_price}')`
                , function (error, results, fields) {
                    if (error) rej(error);
                    console.log('results', results)
                    if (results.affectedRows == 1) {
                        let p1 = new Promise((res, rej) => {
                            pool.query(`insert into table_task (table_publish_id,task_money,task_url,task_type,task_num) \
                                    values (${results.insertId},'${obj.follow_price}','${obj.url}','关注','${obj.follow_num}')`
                                , function (error, results, fields) {
                                    if (error) rej(error);
                                    res(results)
                                });
                        })
                        let p2 = new Promise((res, rej) => {
                            pool.query(`insert into table_task (table_publish_id,task_money,task_url,task_type,task_num) \
                                    values (${results.insertId},'${obj.thumb_price}','${obj.url}','点赞','${obj.thumb_num}')`
                                , function (error, results, fields) {
                                    if (error) rej(error);
                                    res(results)
                                });
                        })
                        let p3 = new Promise((res, rej) => {
                            pool.query(`insert into table_task (table_publish_id,task_money,task_url,task_type,task_num) \
                                    values (${results.insertId},'${obj.comment_price}','${obj.url}','评论','${obj.comment_num}')`
                                , function (error, results, fields) {
                                    if (error) rej(error);
                                    res(results)
                                });
                        })
                        let p4 = new Promise((res, rej) => {
                            pool.query(`update table_user set money=money-${money},money_publish=money_publish+${money} where wx_openid='${obj.wx_openid}'`, function (error, results, fields) {
                                if (error) rej(error);
                                res(results)
                            });
                        })
                        Promise.all([p1, p2, p3, p4]).then(() => {
                            res(results)
                        }).catch(err => {
                            rej(err)
                        })
                    }
                });
        })
    },
    async publishMy({ wx_openid }) {
        return new Promise((res, rej) => {
            pool.query(`select id,state,url,comment_num,comment_finish_num,follow_num,follow_finish_num,thumb_num,thumb_finish_num from table_publish where wx_openid='${wx_openid}' `, function (error, results, fields) {
                if (error) rej(error);
                res(results)
            });
        })
    },
    async getPublishById({ id, wx_openid }) {
        return new Promise((res, rej) => {
            pool.query(`select id,state,url,comment_num,comment_finish_num,follow_num,follow_finish_num,thumb_num,thumb_finish_num from table_publish where id='${id}' `, function (error, results, fields) {
                if (error) rej(error);
                res(results)
            });
        })
    },
    async editPublishTask({ id, state }) {
        let p0 = new Promise((res, rej) => {
            pool.query(`update table_publish set state=${state} where id=${id}`, function (error, results, fields) {
                if (error) rej(error);
                res(results)
            });
        })
        let p1 = new Promise((res, rej) => {
            pool.query(`update table_task set state=${state} where table_publish_id=${id}`, function (error, results, fields) {
                if (error) rej(error);
                res(results)
            });
        })
        return Promise.all([p0, p1])
    },
}