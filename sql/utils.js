const mysql = require('mysql')
const { sql_user, sql_password } = require('../config')
const { getRes } = require('../returnCode')

let pool = mysql.createPool({
    host: 'localhost',
    user: sql_user,
    password: sql_password,
})

const codes = {
    'selectNotFound': 'selectNotFound',
    'affectedRowsErr': 'affectedRowsErr'
}

module.exports = {
    codes,
    tc(fn) {
        return async function () {
            try {
                return await fn.apply(null, arguments)
            } catch (error) {
                console.log('error', error)
                return getRes('unknown')
            }
        }
    },
    addColumn({ tableName, columnName, columnType, defaultValue }) {
        pool.query(`SELECT NULL FROM INFORMATION_SCHEMA.COLUMNS \
                        WHERE TABLE_SCHEMA='mydb' AND TABLE_NAME='${tableName}' AND column_name='${columnName}';`, (error, results) => {
            if (!results.length) {
                if (defaultValue != undefined) {
                    pool.query(`ALTER TABLE mydb.${tableName} ADD ${columnName} ${columnType} DEFAULT ${defaultValue};`, function (error, results, fields) {
                        if (error) throw error;
                        console.log(`alter table '${columnName}',The solution is: `, results);
                    });
                } else {
                    pool.query(`ALTER TABLE mydb.${tableName} ADD ${columnName} ${columnType}`, function (error, results, fields) {
                        if (error) throw error;
                        console.log(`alter table '${columnName}',The solution is: `, results);
                    });
                }
            }
        })
    },
    query(sql, values) {
        return new Promise((res, rej) => {
            pool.query(sql, values, function (error, results, fields) {
                if (error) {
                    console.log('sql error:', sql, values, error)
                    return rej(error);
                }
                res(results)
            })
        })
    },
    queryTestLength(sql, values) {
        return new Promise((res, rej) => {
            pool.query(sql, values, function (error, results, fields) {
                if (error) {
                    console.log('sql error:', sql, values, error)
                    return rej(error);
                }
                if (!results.length) {
                    console.log('sql length=0', sql, values)
                    return rej(new Error(codes.selectNotFound))
                }
                res(results)
            })
        })
    },
    queryTestAffectedRows(sql, values) {
        return new Promise((res, rej) => {
            pool.query(sql, values, function (error, results, fields) {
                if (error) {
                    console.log('sql error:', sql, values, error)
                    return rej(error);
                }
                if (results.affectedRows != 1) {
                    console.log('sql affectedRows', results, sql, values)
                    return rej(new Error(codes.affectedRowsErr))
                }
                res(results)
            })
        })
    },
    // select(tableName, columns, conditions, valueList) {
    //     return query(`select ${columns} from mydb.${tableName} where ${conditions}`, valueList)
    // },
    // insert(tableName, columns, valueList) {
    //     return query(`insert into mydb.${tableName} (${columns}) values (${Array(columns.split(',').length).fill('?')})`, valueList)
    // },
    // update(tableName, columns, conditions, valueList) {
    //     return query(`update mydb.${tableName} set ${columns} where ${conditions}`, valueList)
    // }
}