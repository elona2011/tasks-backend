const { sql_user, sql_password } = require('../config')
const { getOk, getRes } = require('../returnCode')
const mysql = require('mysql')
const { getNameByType } = require('../services/utils')
const { query, queryTestLength, queryTestAffectedRows, tc } = require('./utils')

let pool = mysql.createPool({
    host: 'localhost',
    user: sql_user,
    password: sql_password,
    database: "mydb"
})

module.exports = {
    newtasks: tc(async ({ wx_openid }) => {
        let r = await query(`select id,task_money,task_type,task_num,task_used_num,task_finish_num,task_url,task_dywx,qr_code,video_name from mydb.table_task \
        where state=1 and task_num-task_used_num>0 and id not in (select table_task_id from mydb.table_user_task where wx_openid=?) `, [wx_openid])
        return getOk(r)
    }),
    mytasks: tc(async ({ wx_openid }) => {
        let r = await query(`select a.id,table_task_id,a.task_money,a.task_type,a.task_state,a.task_img,b.task_url,b.task_dywx,b.qr_code,b.video_name from mydb.table_user_task a left join mydb.table_task b on a.table_task_id = b.id where a.wx_openid=?`, [wx_openid])
        return getOk(r)
    }),
    // async getTask({ wx_openid, id }) {
    //     return new Promise((res, rej) => {
    //         pool.query(`select id,task_type,task_num,task_used_num,task_finish_num,task_url from table_task where id=?`, [id], function (error, results, fields) {
    //             if (error) {
    //                 console.log('error', error)
    //                 return rej(error);
    //             }
    //             if (results.length) {
    //                 res(getOk(results[0]))
    //             } else {
    //                 res(getRes('taskNotFound'))
    //             }
    //         });
    //     })
    // },
    startTask: tc(async ({ wx_openid, id }) => {
        let r = await query(`update mydb.table_task set task_used_num=task_used_num+1 where id=? and task_num>task_used_num and id not in (select table_task_id from mydb.table_user_task where wx_openid=?)`, [id, wx_openid])
        if (r.affectedRows != 1) return getRes('taskIsOut')

        let rr = await queryTestLength(`select task_type,table_publish_id,task_money,wx_openid_publish from mydb.table_task where id=?`, [id])

        let { task_type, table_publish_id, task_money, wx_openid_publish } = rr[0]
        let r3 = await queryTestAffectedRows(`insert into mydb.table_user_task (wx_openid,table_task_id,table_publish_id,task_money,task_type,task_state,wx_openid_publish) \
            values (?,?,?,?,?,'1',?)`, [wx_openid, id, table_publish_id, task_money, task_type, wx_openid_publish])

        let type_doing_num_name = getNameByType(task_type) + '_doing_num'
        await queryTestAffectedRows(`update mydb.table_publish set ${type_doing_num_name}=${type_doing_num_name}+1 where id=(select table_publish_id from mydb.table_task where id=?)`, [id])

        return getOk(r3.insertId)
    }),
    usertask: tc(async ({ wx_openid, id }) => {
        let r = await queryTestLength(`select table_task_id,a.task_money,a.task_type,a.task_state,a.task_img,b.task_url,b.task_dywx,b.qr_code,b.video_name from mydb.table_user_task a left join mydb.table_task b on a.table_task_id = b.id where a.wx_openid=? and a.id=?`, [wx_openid, id])
        if (r.length) {
            return getOk(r[0])
        } else {
            return getRes('taskNotFound')
        }
    }),
    async updatetask({ id, wx_openid, img }) {
        return new Promise((res, rej) => {
            pool.query(`update table_user_task set task_state=2,task_img=? where id=? and wx_openid=?`, [img, id, wx_openid], function (error, results) {
                if (error) {
                    console.log('error', error)
                    return rej(error);
                }
                if (results.affectedRows == 1) {
                    pool.query(`select table_task_id,table_publish_id,task_money,task_type from table_user_task where id=?`, [id], function (error, results) {
                        if (error) {
                            console.log('error', error)
                            return rej(error);
                        }
                        if (results.length) {
                            // let { table_task_id, table_publish_id, task_money, task_type } = results[0]
                            // let p0 = new Promise((res, rej) => {
                            //     pool.query(`update table_task set task_finish_num=task_finish_num+1 where id=${table_task_id}`, function (error, results, fields) {
                            //         if (error) {
                            //     console.log('error', error)
                            //     return rej(error);
                            // }
                            //         if (results.affectedRows == 1) {
                            //             res()
                            //         }
                            //     });
                            // })
                            // let name = getNameByType(task_type) + '_finish_num'
                            // let p3 = new Promise((res, rej) => {
                            //     pool.query(`update table_publish set ${name}=${name}+1 where id=${table_publish_id}`, function (error, results, fields) {
                            //         if (error) {
                            //     console.log('error', error)
                            //     return rej(error);
                            // }
                            //         if (results.affectedRows == 1) {
                            //             res()
                            //         }
                            //     });
                            // })
                            // let p1 = new Promise((res, rej) => {
                            //     pool.query(`update table_user set money=money+${task_money} where wx_openid='${wx_openid}'`, function (error, results, fields) {
                            //         if (error) {
                            //             console.log(error)
                            //             rej(error);
                            //         }
                            //         console.log('results', results)
                            //         if (results.affectedRows == 1) {
                            //             res()
                            //         }
                            //     });
                            // })
                            let p2 = new Promise((res, rej) => {
                                pool.query(`select table_task_id,task_money,task_type,task_state,task_img,(select task_url from mydb.table_task where id=table_task_id) as task_url from mydb.table_user_task where id=?`, [id], function (error, results) {
                                    if (error) {
                                        console.log('error', error)
                                        return rej(error);
                                    }
                                    res(getOk(results[0]))
                                });
                            })
                            Promise.all([p2]).then(re => {
                                res(re[0])
                            })
                        }
                    });
                } else {
                    res(getRes('taskNotFound'))
                }
            });
        })
    },
}
