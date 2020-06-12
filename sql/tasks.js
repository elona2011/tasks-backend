const { sql_user, sql_password, r } = require('../config')
const mysql = require('mysql')

pool = mysql.createPool({
    host: 'localhost',
    user: sql_user,
    password: sql_password,
    database: "mydb"
})

function getNameByType(task_type) {
    console.log('task_type', task_type, typeof (task_type))
    return task_type == '关注' ? 'follow' : (task_type == '点赞' ? 'thumb' : 'comment')
}
module.exports = {
    async newtasks({ wx_openid }) {
        return new Promise((res, rej) => {
            pool.query(`select id,task_type,task_num,task_used_num,task_finish_num,task_url from table_task where state=1 and task_num-task_used_num>0 and id not in (select table_task_id from table_user_task where wx_openid='${wx_openid}') `, function (error, results, fields) {
                if (error) rej(error);
                res(r.ok(results))
            });
        })
    },
    async mytasks({ wx_openid }) {
        return new Promise((res, rej) => {
            pool.query(`select id,table_task_id,task_type,task_state,(select task_url from mydb.table_task where id=table_task_id) as task_url from table_user_task where wx_openid='${wx_openid}'`, function (error, results, fields) {
                if (error) rej(error);
                res(r.ok(results))
            });
        })
    },
    async getTask(id) {
        return new Promise((res, rej) => {
            pool.query(`select id,task_type,task_num,task_used_num,task_finish_num,task_url from table_task where id=${id}`, function (error, results, fields) {
                if (error) rej(error);
                if (results.length) {
                    res(r.ok(results[0]))
                } else {
                    res(r.taskNotFound)
                }
            });
        })
    },
    async startTask({ wx_openid, id }) {
        return new Promise((res, rej) => {
            pool.query(`update table_task set task_used_num=task_used_num+1 where id=${id} and task_num>task_used_num and id not in (select id from table_user_task where wx_openid='${wx_openid}')`, function (error, results, fields) {
                if (error) rej(error);
                if (results.affectedRows > 0) {
                    pool.query(`select task_type,table_publish_id,task_money from table_task where id=${id}`, function (error, results, fields) {
                        if (error) rej(error);
                        if (results.length) {
                            let { task_type, table_publish_id, task_money } = results[0]

                            let p1 = new Promise((res, rej) => {
                                pool.query(`insert into table_user_task (wx_openid,table_task_id,table_publish_id,task_money,task_type,task_state) values ('${wx_openid}','${id}','${table_publish_id}','${task_money}','${task_type}','1')`, function (error, results, fields) {
                                    if (error) rej(error);
                                    res(results)
                                });
                            })
                            let p2 = new Promise((res, rej) => {
                                let type_doing_num_name = getNameByType(task_type) + '_doing_num'
                                pool.query(`update table_publish set ${type_doing_num_name}=${type_doing_num_name}+1 where id=(select table_publish_id from table_task where id=${id})`, function (error, results, fields) {
                                    if (error) rej(error);
                                    res(results)
                                });
                            })
                            Promise.all([p1, p2]).then(r1 => {
                                res(r.ok(r1[0].insertId))
                            }).catch(err => {
                                rej(err)
                            })
                        }
                    })
                } else {
                    res(r.taskIsOut)
                }
            });
        })
    },
    async usertask({ id }) {
        return new Promise((res, rej) => {
            pool.query(`select table_task_id,task_type,task_state,(select task_url from mydb.table_task where id=table_task_id) as task_url from mydb.table_user_task where id=${id}`, function (error, results, fields) {
                if (error) rej(error);
                if (results.length) {
                    res(r.ok(results[0]))
                } else {
                    res(r.taskNotFound)
                }
            });
        })
    },
    async updatetask({ id, wx_openid }) {
        return new Promise((res, rej) => {
            pool.query(`update table_user_task set task_state=3 where id=${id}`, function (error, results, fields) {
                if (error) rej(error);
                if (results.affectedRows == 1) {
                    pool.query(`select table_task_id,table_publish_id,task_money,task_type from table_user_task where id=${id}`, function (error, results, fields) {
                        if (error) rej(error);
                        if (results.length) {
                            let { table_task_id, table_publish_id, task_money, task_type } = results[0]
                            let p0 = new Promise((res, rej) => {
                                pool.query(`update table_task set task_finish_num=task_finish_num+1 where id=${table_task_id}`, function (error, results, fields) {
                                    if (error) rej(error);
                                    if (results.affectedRows == 1) {
                                        res()
                                    }
                                });
                            })
                            let name = getNameByType(task_type) + '_finish_num'
                            let p3 = new Promise((res, rej) => {
                                pool.query(`update table_publish set ${name}=${name}+1 where id=${table_publish_id}`, function (error, results, fields) {
                                    if (error) rej(error);
                                    if (results.affectedRows == 1) {
                                        res()
                                    }
                                });
                            })
                            let p1 = new Promise((res, rej) => {
                                pool.query(`update table_user set money=money+${task_money} where wx_openid='${wx_openid}'`, function (error, results, fields) {
                                    if (error) {
                                        console.log(error)
                                        rej(error);
                                    }
                                    console.log('results', results)
                                    if (results.affectedRows == 1) {
                                        res()
                                    }
                                });
                            })
                            let p2 = new Promise((res, rej) => {
                                pool.query(`select table_task_id,task_type,task_state,(select task_url from mydb.table_task where id=table_task_id) as task_url from mydb.table_user_task where id=${id}`, function (error, results, fields) {
                                    if (error) rej(error);
                                    res(r.ok(results[0]))
                                });
                            })
                            Promise.all([p2, p1, p0, p3]).then(re => {
                                res(re[0])
                            })
                        }
                    });
                } else {
                    res(r.taskNotFound)
                }
            });
        })
    },
    async getUserMoney({ wx_openid }) {
        return new Promise((res, rej) => {
            pool.query(`select money,money_pay from table_user where wx_openid='${wx_openid}'`, function (error, results, fields) {
                if (error) rej(error);
                if (results.length) {
                    res(r.ok(results[0]))
                } else {
                    res(r.taskNotFound)
                }
            });
        })
    },
    async getUserPayDetail({ wx_openid, id }) {
        return new Promise((res, rej) => {
            pool.query(`select result_code from table_pay where id='${id}'`, function (error, results, fields) {
                if (error) rej(error);
                if (results.length) {
                    res(r.ok(results[0]))
                } else {
                    res(r.taskNotFound)
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
                            res(r.ok(results.insertId))
                        }
                        res(r.dbFail)
                    });
                } else {
                    res(r.userNotFound)
                }
            });
        })
    },
}