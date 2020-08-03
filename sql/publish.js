const { sql_user, sql_password } = require('../config')
const { getOk, getRes } = require('../returnCode')
const mysql = require('mysql')
const { getNameByType } = require('../services/utils')
const { query, queryTestLength, queryTestAffectedRows, tc } = require('./utils')

pool = mysql.createPool({
    host: 'localhost',
    user: sql_user,
    password: sql_password,
    database: "mydb"
})

module.exports = {
    addPublish: tc(async ({ wx_openid, task_dywx, url, follow_num, follow_price, follow_num_ex, follow_id, comment_num, comment_price,
        comment_num_ex, comment_id, thumb_num, thumb_price, thumb_num_ex, thumb_id, video_name, qr_code }) => {
        let money = follow_price * follow_num + thumb_price * thumb_num + comment_price * comment_num
        let r = await query(`select wx_openid from mydb.table_user where wx_openid=? and money>=?`, [wx_openid, money])
        if (r.length) {
            let insertId = await queryTestAffectedRows(`insert into mydb.table_publish \
            (wx_openid,money,task_dywx,url,video_name,qr_code,follow_num,follow_money,thumb_num,thumb_money,comment_num,comment_money,
                follow_id,thumb_id,comment_id,follow_num_ex,thumb_num_ex,comment_num_ex) \
                            values (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                [wx_openid, money, task_dywx, url, video_name, qr_code, follow_num, follow_price, thumb_num, thumb_price,
                    comment_num, comment_price, follow_id, thumb_id, comment_id, follow_num_ex, thumb_num_ex, comment_num_ex])

            if (follow_num > follow_num_ex) {
                await queryTestAffectedRows(`insert into mydb.table_task (wx_openid_publish,table_publish_id,task_money,task_dywx,task_url,task_type,task_num,video_name,qr_code) \
                                        values (?,?,?,?,?,'关注',?,?,?)`, [wx_openid, insertId, follow_price, task_dywx, url, follow_num - follow_num_ex, video_name, qr_code])
            }
            if (thumb_num > thumb_num_ex) {
                await queryTestAffectedRows(`insert into mydb.table_task (wx_openid_publish,table_publish_id,task_money,task_dywx,task_url,task_type,task_num,video_name,qr_code) \
                            values (?,?,?,?,?,'点赞',?,?,?)`, [wx_openid, insertId, thumb_price, task_dywx, url, thumb_num - thumb_num_ex, video_name, qr_code])
            }
            if (comment_num > comment_num_ex) {
                await queryTestAffectedRows(`insert into mydb.table_task (wx_openid_publish,table_publish_id,task_money,task_dywx,task_url,task_type,task_num,video_name,qr_code) \
                            values (?,?,?,?,?,'评论',?,?,?)`, [wx_openid, insertId, comment_price, task_dywx, url, comment_num - comment_num_ex, video_name, qr_code])
            }

            await queryTestAffectedRows(`update mydb.table_user set money=money-?,money_publish=money_publish+? \
                            where wx_openid=? and money>=?`, [money, money, wx_openid, money])

            return getOk({})
        } else {
            return getRes('moneyNotEnough')
        }
    }),
    publishMy: tc(async ({ wx_openid }) => {
        let r = await query(`select id,state,url,video_name,task_dywx,comment_num,comment_finish_num,follow_num,follow_finish_num,thumb_num,thumb_finish_num,\
        follow_num_ex,thumb_num_ex,comment_num_ex,follow_id,thumb_id,comment_id,\
        (select count(*) from mydb.table_user_task where table_publish_id=a.id and task_state=2) as state2num from mydb.table_publish a where wx_openid=? `, [wx_openid])
        return getOk(r)
    }),
    async getPublishById({ id, wx_openid }) {
        return new Promise((res, rej) => {
            pool.query(`select id,state,url,comment_num,comment_finish_num,follow_num,follow_finish_num,thumb_num,thumb_finish_num from table_publish where wx_openid=? and id=? `, [wx_openid, id], function (error, results, fields) {
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
            pool.query(`select id,task_img,table_task_id from table_user_task where wx_openid_publish=? and table_publish_id=? and task_state=2`, [wx_openid, id], function (error, results, fields) {
                if (error) {
                    console.log('error', error)
                    return rej(error);
                }
                res(results)
            });
        })
    },
    publishCheck: tc(async ({ id, pass, wx_openid_publish }) => {
        let r = await query(`update mydb.table_user_task set task_state=${pass ? 3 : 1} where id=? and wx_openid_publish=?`, [id, wx_openid_publish])
        if (r.affectedRows != 1) return getRes('taskNotFound')

        r = await queryTestLength(`select wx_openid,table_task_id,table_publish_id,task_money,task_type from mydb.table_user_task where id=?`, [id])
        let { wx_openid, table_task_id, table_publish_id, task_money, task_type } = r[0]
        if (pass) {
            await queryTestAffectedRows(`update mydb.table_task set task_finish_num=task_finish_num+1 where id=?`, [table_task_id])

            let name = getNameByType(task_type) + '_finish_num'
            await queryTestAffectedRows(`update mydb.table_publish set ${name}=${name}+1 where id=?`, [table_publish_id])

            await queryTestAffectedRows(`update mydb.table_user set money=money+? where wx_openid=?`, [task_money, wx_openid])
        }
        r = await query(`select id,task_img,table_task_id from mydb.table_user_task where table_publish_id=? and task_state=2`, [table_publish_id])
        return getOk(r)
    }),
    routineCheck: tc(async () => {
        console.log('routineCheck start:', new Date)
        console.log('task_state=2')
        let r = await query('select id,wx_openid,table_task_id,table_publish_id,task_money,task_type from mydb.table_user_task where task_state=2 and create_time < NOW() - INTERVAL 1 DAY')
        if (r.length) {
            r.forEach(async n => {
                await query(`update mydb.table_user_task set task_state=3 where id=?`, [n.id])
                await queryTestAffectedRows(`update mydb.table_task set task_finish_num=task_finish_num+1 where id=?`, [n.table_task_id])
                let name = getNameByType(n.task_type) + '_finish_num'
                await queryTestAffectedRows(`update mydb.table_publish set ${name}=${name}+1 where id=?`, [n.table_publish_id])
                await queryTestAffectedRows(`update mydb.table_user set money=money+? where wx_openid=?`, [n.task_money, n.wx_openid])
            })
        }

        console.log('task_state=1')
        r = await query('select id,wx_openid,table_task_id,table_publish_id,task_money,task_type from mydb.table_user_task where task_state=1 and create_time < NOW() - INTERVAL 1 DAY')
        if (r.length) {
            r.forEach(async n => {
                await query(`delete from mydb.table_user_task where id=?`, [n.id])
                await queryTestAffectedRows(`update mydb.table_task set task_used_num=task_used_num-1 where id=?`, [n.table_task_id])
                let name = getNameByType(n.task_type) + '_doing_num'
                await queryTestAffectedRows(`update mydb.table_publish set ${name}=${name}-1 where id=?`, [n.table_publish_id])
            })
        }
        console.log('routineCheck finish:', new Date)
    }),
    async editPublishTask({ id, state, wx_openid }) {
        let p0 = new Promise((res, rej) => {
            pool.query(`update table_publish set state=? where wx_openid=? and id=?`, [state, wx_openid, id], function (error, results, fields) {
                if (error) {
                    console.log('error', error)
                    return rej(error);
                }
                res(results)
            });
        })
        let p1 = new Promise((res, rej) => {
            pool.query(`update table_task set state=? where wx_openid=? and table_publish_id=?`, [state, wx_openid, id], function (error, results, fields) {
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