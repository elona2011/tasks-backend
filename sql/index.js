const { sql_user, sql_password } = require('../config')
const mysql = require('mysql')

const init = () => {
    let pool = mysql.createPool({
        host: 'localhost',
        user: sql_user,
        password: sql_password,
    })

    pool.query(`create database if not exists mydb;`, function (error, results, fields) {
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
                        jwt text,\
                        is_authorize BOOL default false,\
                        dy_openid varchar(100) default '',\
                        dy_name varchar(50) default '',\
                        dy_id varchar(50) default '',\
                        access_token varchar(1000) default '',\
                        login_num int default 1,\
                        last_login_time DATETIME DEFAULT CURRENT_TIMESTAMP,\
                        is_subscribe BOOL default true\
                    );`, function (error, results, fields) {
            if (error) throw error;
            console.log('The solution is: ', results);
        });

        pool.query(`create table if not exists table_publish (\
            id int AUTO_INCREMENT PRIMARY KEY,\
            state int default 1,\
            wx_openid varchar(100) default '',\
            dy_openid varchar(100) default '',\
            access_token varchar(1000) default '',\
            task_content text,\
            url text,\
            follow_num int,\
            follow_finish_num int default 0,\
            follow_doing_num int default 0,\
            thumb_num int,\
            thumb_finish_num int default 0,\
            thumb_doing_num int default 0,\
            comment_num int,\
            comment_finish_num int default 0,\
            comment_doing_num int default 0\
        );`, function (error, results, fields) {
            if (error) throw error;
            console.log('The solution is: ', results);
        });

        pool.query(`create table if not exists table_task (\
            id int AUTO_INCREMENT PRIMARY KEY,\
            table_publish_id int,\
            state int default 1,\
            task_content text,\
            task_url text,\
            task_type varchar(50),\
            task_num int,\
            task_used_num int default 0,\
            task_finish_num int default 0,\
            dy_openid varchar(100) default '',\
            access_token varchar(1000) default ''\
        );`, function (error, results, fields) {
            if (error) throw error;
            console.log('The solution is: ', results);
        });

        pool.query(`create table if not exists table_user_task (\
            id int AUTO_INCREMENT PRIMARY KEY,\
            wx_openid varchar(100) default '',\
            table_task_id int,\
            task_type varchar(50),\
            task_state int,\
            dy_id varchar(50) default '',\
            dy_name varchar(50) default '',\
            dy_openid varchar(100) default '',\
            access_token varchar(1000) default ''\
        );`, function (error, results, fields) {
            if (error) throw error;
            console.log('The solution is: ', results);
        });
    });
}

module.exports = { init }