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
            wx_openid varchar(100) default '',\
            dy_openid varchar(100) default '',\
            access_token varchar(1000) default '',\
            url text,\
            follow_num int,\
            thumb_num int,\
            comment_num int\
        );`, function (error, results, fields) {
            if (error) throw error;
            console.log('The solution is: ', results);
        });

        pool.query(`create table if not exists table_task (\
            id int AUTO_INCREMENT PRIMARY KEY,\
            task_content text,\
            task_url text,\
            task_type int,\
            task_num int,\
            task_used_num int,\
            task_finish_num int,\
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
            task_type int,\
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