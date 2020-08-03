const { sql_user, sql_password } = require('../config')
const mysql = require('mysql')
const { addColumn } = require('./utils')
const { routineCheck } = require('./publish')

module.exports = {
    initSql() {
        let pool = mysql.createPool({
            host: 'localhost',
            user: sql_user,
            password: sql_password,
        })

        pool.query(`create database if not exists mydb;`, function (error, results) {
            if (error) throw error;
            console.log('The solution is: ', results);

            pool = mysql.createPool({
                host: 'localhost',
                user: sql_user,
                password: sql_password,
                database: "mydb"
            })

            pool.query(`create table if not exists table_user (\
                                wx_openid varchar(100) PRIMARY KEY,\
                                money int default 0,\
                                money_in int default 0,\
                                money_pay int default 0,\
                                money_publish int default 0,\
                                jwt text,\
                                is_authorize BOOL default false,\
                                dy_openid varchar(100) default '',\
                                dy_name varchar(50) default '',\
                                dy_id varchar(50) default '',\
                                access_token varchar(1000) default '',\
                                login_num int default 1,\
                                last_login_time DATETIME DEFAULT CURRENT_TIMESTAMP,\
                                is_subscribe BOOL default true\
                            );`, function (error, results) {
                if (error) throw error;
                console.log('The solution is: ', results);
                addColumn({
                    tableName: 'table_user',
                    columnName: 'wx_openid_new',
                    columnType: 'varchar(100)',
                })
                // addColumn({
                //     tableName: 'table_user',
                //     columnName: 'wx_access_token',
                //     columnType: 'varchar(1000)',
                // })
            });

            pool.query(`create table if not exists table_publish (\
                    id int AUTO_INCREMENT PRIMARY KEY,\
                    uuid varchar(100),\
                    money int,\
                    state int default 1,\
                    wx_openid varchar(100) default '',\
                    dy_openid varchar(100) default '',\
                    access_token varchar(1000) default '',\
                    task_content text,\
                    url text,\
                    follow_num int,\
                    follow_finish_num int default 0,\
                    follow_doing_num int default 0,\
                    follow_money int,\
                    thumb_num int,\
                    thumb_finish_num int default 0,\
                    thumb_doing_num int default 0,\
                    thumb_money int,\
                    comment_num int,\
                    comment_finish_num int default 0,\
                    comment_doing_num int default 0,\
                    comment_money int\
                );`, function (error, results) {
                if (error) throw error;
                console.log('The solution is: ', results);

                addColumn({
                    tableName: 'table_publish',
                    columnName: 'task_dywx',
                    columnType: 'varchar(10)',
                    defaultValue: "'dy'"
                })
                addColumn({
                    tableName: 'table_publish',
                    columnName: 'video_name',
                    columnType: 'text'
                })
                addColumn({
                    tableName: 'table_publish',
                    columnName: 'qr_code',
                    columnType: 'varchar(100)'
                })

                //第三方订单id
                addColumn({
                    tableName: 'table_publish',
                    columnName: 'follow_id',
                    columnType: 'varchar(50)'
                })
                addColumn({
                    tableName: 'table_publish',
                    columnName: 'thumb_id',
                    columnType: 'varchar(50)'
                })
                addColumn({
                    tableName: 'table_publish',
                    columnName: 'comment_id',
                    columnType: 'varchar(50)'
                })
                addColumn({
                    tableName: 'table_publish',
                    columnName: 'follow_num_ex',
                    columnType: 'int'
                })
                addColumn({
                    tableName: 'table_publish',
                    columnName: 'thumb_num_ex',
                    columnType: 'int'
                })
                addColumn({
                    tableName: 'table_publish',
                    columnName: 'comment_num_ex',
                    columnType: 'int'
                })
            });

            pool.query(`create table if not exists table_task (\
                    id int AUTO_INCREMENT PRIMARY KEY,\
                    table_publish_id int,\
                    task_money int,\
                    money int,\
                    state int default 1,\
                    task_content text,\
                    task_url text,\
                    task_type varchar(50),\
                    task_num int,\
                    task_used_num int default 0,\
                    task_finish_num int default 0,\
                    wx_openid_publish varchar(100) default '',\
                    dy_openid varchar(100) default '',\
                    access_token varchar(1000) default ''\
                );`, function (error, results, fields) {
                if (error) throw error;
                console.log('The solution is: ', results);

                addColumn({
                    tableName: 'table_task',
                    columnName: 'task_dywx',
                    columnType: 'varchar(10)',
                    defaultValue: "'dy'"
                })
                addColumn({
                    tableName: 'table_task',
                    columnName: 'video_name',
                    columnType: 'text'
                })
                addColumn({
                    tableName: 'table_task',
                    columnName: 'qr_code',
                    columnType: 'varchar(100)'
                })
            });

            pool.query(`create table if not exists table_user_task (\
                    id int AUTO_INCREMENT PRIMARY KEY,\
                    wx_openid varchar(100) default '',\
                    table_task_id int,\
                    table_publish_id int,\
                    task_money int,\
                    task_type varchar(50),\
                    task_state int,\
                    task_img varchar(100),\
                    dy_id varchar(50) default '',\
                    dy_name varchar(50) default '',\
                    wx_openid_publish varchar(100) default '',\
                    dy_openid varchar(100) default '',\
                    access_token varchar(1000) default ''\
                );`, function (error, results, fields) {
                if (error) throw error;
                console.log('The solution is: ', results);
                addColumn({
                    tableName: 'table_user_task',
                    columnName: 'create_time',
                    columnType: 'DATETIME',
                    defaultValue: "CURRENT_TIMESTAMP"
                })
            });

            pool.query(`create table if not exists table_pay (\
                    id int AUTO_INCREMENT PRIMARY KEY,\
                    money_type int,\
                    wx_openid varchar(100) default '',\
                    money_before int,\
                    money int,\
                    money_after int,\
                    apply_time DATETIME DEFAULT CURRENT_TIMESTAMP,\
                    wx_id varchar(50) default '',\
                    return_code varchar(100) default '',\
                    return_msg varchar(200) default '',\
                    result_code varchar(100) default '',\
                    err_code varchar(100) default '',\
                    err_code_des varchar(200) default '',\
                    partner_trade_no varchar(100) default '',\
                    payment_no varchar(100) default '',\
                    payment_time varchar(100) default '',\
                    is_subscribe varchar(100) default '',\
                    trade_type varchar(100) default '',\
                    bank_type varchar(100) default '',\
                    total_fee int,\
                    transaction_id varchar(100) default '',\
                    device_info varchar(100) default '',\
                    out_trade_no varchar(100) default '',\
                    time_end varchar(100) default ''\
                );`, function (error, results, fields) {
                if (error) throw error;
                console.log('The solution is: ', results);
            });
        });
    },
    routineCheck() {
        setInterval(routineCheck, 1000 * 60 * 60)
    }
}

