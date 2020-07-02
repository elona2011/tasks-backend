const { sql_user, sql_password } = require('../config')
const { getOk, getRes } = require('../returnCode')
const mysql = require('mysql')
const { getNameByType } = require('../services/utils')

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
            pool.query(`update table_user set money=money-?,money_publish=money_publish+? \
                    where wx_openid=? and money>=?`, [money, money, obj.wx_openid, money], function (error, results, fields) {
                if (error) {
                    console.log('error', error)
                    return rej(error);
                }
                if (results.affectedRows == 1) {
                    pool.query(`insert into table_publish (wx_openid,money,url,follow_num,follow_money,thumb_num,thumb_money,comment_num,comment_money) \
                        values (?,?,?,?,?,?,?,?,?)`
                        , [obj.wx_openid, money, obj.url, obj.follow_num, obj.follow_price, obj.thumb_num, obj.thumb_price, obj.comment_num, obj.comment_price], function (error, results, fields) {
                            if (error) {
                                console.log('error', error)
                                return rej(error);
                            }
                            console.log('results', results)
                            if (results.affectedRows == 1) {
                                let p1 = new Promise((res, rej) => {
                                    pool.query(`insert into table_task (wx_openid_publish,table_publish_id,task_money,task_url,task_type,task_num) \
                                    values (?,?,?,?,'关注',?)`
                                        , [obj.wx_openid, results.insertId, obj.follow_price, obj.url, obj.follow_num], function (error, results, fields) {
                                            if (error) {
                                                console.log('error', error)
                                                return rej(error);
                                            }
                                            res(results)
                                        });
                                })
                                let p2 = new Promise((res, rej) => {
                                    pool.query(`insert into table_task (wx_openid_publish,table_publish_id,task_money,task_url,task_type,task_num) \
                                    values (?,?,?,?,'点赞',?)`
                                        , [obj.wx_openid, results.insertId, obj.thumb_price, obj.url, obj.thumb_num], function (error, results, fields) {
                                            if (error) {
                                                console.log('error', error)
                                                return rej(error);
                                            }
                                            res(results)
                                        });
                                })
                                let p3 = new Promise((res, rej) => {
                                    pool.query(`insert into table_task (wx_openid_publish,table_publish_id,task_money,task_url,task_type,task_num) \
                                    values (?,?,?,?,'评论',?)`
                                        , [obj.wx_openid, results.insertId, obj.comment_price, obj.url, obj.comment_num], function (error, results, fields) {
                                            if (error) {
                                                console.log('error', error)
                                                return rej(error);
                                            }
                                            res(results)
                                        });
                                })

                                Promise.all([p1, p2, p3]).then(() => {
                                    res(results)
                                }).catch(err => {
                                    rej(err)
                                })
                            }
                        });
                } else {
                    res(getRes('moneyNotEnough'))
                }
            });
        })
    },
    async publishMy({ wx_openid }) {
        return new Promise((res, rej) => {
            pool.query(`select id,state,url,comment_num,comment_finish_num,follow_num,follow_finish_num,thumb_num,thumb_finish_num,\
            (select count(*) from mydb.table_user_task where table_publish_id=a.id and task_state=2) as state2num from mydb.table_publish a where wx_openid=? `, [wx_openid], function (error, results, fields) {
                if (error) {
                    console.log('error', error)
                    return rej(error);
                }
                res(results)
            });
        })
    },
    async getPublishById({ id, wx_openid }) {
        return new Promise((res, rej) => {
            pool.query(`select id,state,url,comment_num,comment_finish_num,follow_num,follow_finish_num,thumb_num,thumb_finish_num from table_publish where id=? `, [id], function (error, results, fields) {
                if (error) {
                    console.log('error', error)
                    return rej(error);
                }
                res(results)
            });
        })
    },
    async publishTaskView({ id, wx_openid }) {
        return new Promise((res, rej) => {
            pool.query(`select id,task_img,table_task_id from table_user_task where table_publish_id=? and task_state=2`, [id], function (error, results, fields) {
                if (error) {
                    console.log('error', error)
                    return rej(error);
                }
                res(results)
            });
        })
    },
    async publishCheck({ id, pass, wx_openid_publish }) {
        return new Promise((res, rej) => {
            if (pass) {
                pool.query(`update table_user_task set task_state=3 where id=? and wx_openid_publish=?`, [id, wx_openid_publish], function (error, results, fields) {
                    if (error) {
                        console.log('error', error)
                        return rej(error);
                    }
                    if (results.affectedRows == 1) {
                        pool.query(`select wx_openid,table_task_id,table_publish_id,task_money,task_type from table_user_task where id=?`, [id], function (error, results, fields) {
                            if (error) {
                                console.log('error', error)
                                return rej(error);
                            }
                            if (results.length) {
                                let { wx_openid, table_task_id, table_publish_id, task_money, task_type } = results[0]
                                let p0 = new Promise((res, rej) => {
                                    pool.query(`update table_task set task_finish_num=task_finish_num+1 where id=?`, [table_task_id], function (error, results, fields) {
                                        if (error) {
                                            console.log('error', error)
                                            return rej(error);
                                        }
                                        if (results.affectedRows == 1) {
                                            res()
                                        }
                                    });
                                })
                                let name = getNameByType(task_type) + '_finish_num'
                                let p3 = new Promise((res, rej) => {
                                    pool.query(`update table_publish set ${name}=${name}+1 where id=?`, [table_publish_id], function (error, results, fields) {
                                        if (error) {
                                            console.log('error', error)
                                            return rej(error);
                                        }
                                        if (results.affectedRows == 1) {
                                            res()
                                        }
                                    });
                                })
                                let p1 = new Promise((res, rej) => {
                                    pool.query(`update table_user set money=money+? where wx_openid=?`, [task_money, wx_openid], function (error, results, fields) {
                                        if (error) {
                                            console.log('error', error)
                                            return rej(error);
                                        }
                                        console.log('results', results)
                                        if (results.affectedRows == 1) {
                                            res()
                                        }
                                    });
                                })
                                let p2 = new Promise((res, rej) => {
                                    pool.query(`select id,task_img,table_task_id from table_user_task where table_publish_id=? and task_state=2`, [table_publish_id], function (error, results, fields) {
                                        if (error) {
                                            console.log('error', error)
                                            return rej(error);
                                        }
                                        res(results)
                                    });
                                })
                                Promise.all([p2, p1, p0, p3]).then(re => {
                                    res(re[0])
                                })
                            }
                        });
                    } else {
                        res(getRes('taskNotFound'))
                    }
                });
            } else {
                pool.query(`update table_user_task set task_state=1 where id=? and wx_openid_publish=?`, [id, wx_openid_publish], function (error, results, fields) {
                    if (error) {
                        console.log('error', error)
                        return rej(error);
                    }
                    if (results.affectedRows == 1) {
                        pool.query(`select table_task_id,table_publish_id,task_money,task_type from table_user_task where id=?`, [id], function (error, results, fields) {
                            if (error) {
                                console.log('error', error)
                                return rej(error);
                            }
                            if (results.length) {
                                let { table_publish_id } = results[0]
                                pool.query(`select id,task_img,table_task_id from table_user_task where table_publish_id=? and task_state=2`, [table_publish_id], function (error, results, fields) {
                                    if (error) {
                                        console.log('error', error)
                                        return rej(error);
                                    }
                                    console.log('results', results)
                                    res(results)
                                });
                            }
                        })
                    } else {
                        res(getRes('taskNotFound'))
                    }
                })
            }
        })
    },
    async editPublishTask({ id, state }) {
        let p0 = new Promise((res, rej) => {
            pool.query(`update table_publish set state=? where id=?`, [state, id], function (error, results, fields) {
                if (error) {
                    console.log('error', error)
                    return rej(error);
                }
                res(results)
            });
        })
        let p1 = new Promise((res, rej) => {
            pool.query(`update table_task set state=? where table_publish_id=?`, [state, id], function (error, results, fields) {
                if (error) {
                    console.log('error', error)
                    return rej(error);
                }
                res(results)
            });
        })
        return Promise.all([p0, p1])
    },
}