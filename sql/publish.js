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
        let p0 = new Promise((res, rej) => {
            pool.query(`insert into table_publish (wx_openid,url,follow_num,thumb_num,comment_num) values ('${obj.wx_openid}','${obj.url}','${obj.follow_num}','${obj.thumb_num}','${obj.comment_num}')`
                , function (error, results, fields) {
                    if (error) rej(error);
                    res(results)
                });
        })
        let p1 = new Promise((res, rej) => {
            pool.query(`insert into table_task (task_url,task_type,task_num) values ('${obj.url}','关注','${obj.follow_num}')`
                , function (error, results, fields) {
                    if (error) rej(error);
                    res(results)
                });
        })
        let p2 = new Promise((res, rej) => {
            pool.query(`insert into table_task (task_url,task_type,task_num) values ('${obj.url}','点赞','${obj.thumb_num}')`
                , function (error, results, fields) {
                    if (error) rej(error);
                    res(results)
                });
        })
        let p3 = new Promise((res, rej) => {
            pool.query(`insert into table_task (task_url,task_type,task_num) values ('${obj.url}','评论','${obj.comment_num}')`
                , function (error, results, fields) {
                    if (error) rej(error);
                    res(results)
                });
        })

        return Promise.all([p0, p1, p2, p3])
    },
}