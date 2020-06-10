const { sql_user, sql_password } = require('../config')
const mysql = require('mysql')

pool = mysql.createPool({
    host: 'localhost',
    user: sql_user,
    password: sql_password,
    database: "mydb"
})

module.exports = {
    async getNewTasks({ wx_openid }) {
        return new Promise((res, rej) => {
            pool.query(`select id,task_type,task_num,task_used_num,task_finish_num,task_url from table_task where state<>3 and task_num-task_used_num-task_finish_num>0 and id not in (select id from table_user_task where wx_openid='${wx_openid}') `, function (error, results, fields) {
                if (error) rej(error);
                res(results)
            });
        })
    },
    async mytasks({ wx_openid }) {
        return new Promise((res, rej) => {
            pool.query(`select id,table_task_id,task_type,task_state,(select task_url from mydb.table_task where id=table_task_id) as task_url from table_user_task where wx_openid='${wx_openid}'`, function (error, results, fields) {
                if (error) rej(error);
                res(results)
            });
        })
    },
    async getTask(id) {
        return new Promise((res, rej) => {
            pool.query(`select id,task_type,task_num,task_used_num,task_finish_num,task_url from table_task where id=${id}`, function (error, results, fields) {
                if (error) rej(error);
                res(results)
            });
        })
    },
    async startTask({ wx_openid, id, task_type, task_state }) {
        let p0 = new Promise((res, rej) => {
            pool.query(`update table_task set task_used_num=task_used_num+1 where id=${id}`, function (error, results, fields) {
                if (error) rej(error);
                res(results)
            });
        })
        let p1 = new Promise((res, rej) => {
            pool.query(`insert into table_user_task (wx_openid,table_task_id,task_type,task_state) values ('${wx_openid}','${id}','${task_type}','${task_state}')`, function (error, results, fields) {
                if (error) rej(error);
                res(results)
            });
        })
        let p2 = new Promise((res, rej) => {
            let type_doing_num_name = task_type == 1 ? 'follow_doing_num' : (task_type == 2 ? 'thumb_doing_num' : 'comment_doing_num')
            pool.query(`update table_publish set ${type_doing_num_name}=${type_doing_num_name}+1 where id=(select table_publish_id from table_task where id=${id})`, function (error, results, fields) {
                if (error) rej(error);
                res(results)
            });
        })
        return Promise.all([p1, p0, p2])
    },
    async usertask({ id }) {
        return new Promise((res, rej) => {
            pool.query(`select table_task_id,task_type,task_state,(select task_url from mydb.table_task where id=table_task_id) as task_url from mydb.table_user_task where id=${id}`, function (error, results, fields) {
                if (error) rej(error);
                res(results)
            });
        })
    },
    async updatetask({ id, task_state }) {
        return new Promise((res, rej) => {
            pool.query(`update table_user_task set task_state=2 where id=${id}`, function (error, results, fields) {
                if (error) rej(error);
                pool.query(`select table_task_id,task_type,task_state,(select task_url from mydb.table_task where id=table_task_id) as task_url from mydb.table_user_task where id=${id}`, function (error, results, fields) {
                    if (error) rej(error);
                    res(results)
                });
            });
        })
    },
}