const mysql = require('mysql');

const DB_USER = "taskhub";
const DB_PASSWORD = "supertaskhub";
const DB_NAME = "taskhub";

const mySQLOptions = {
    host: 'localhost',
    port: 3306,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
};

var connection = mysql.createConnection(mySQLOptions);

exports.getUser = (id) => {
    let sql = "SELECT * FROM users WHERE id = ?";
    connection.query(sql, [id], (error, results, fields) => {
        if(error) {
            throw error;
        } else {
            console.log(results);
            return results;
        }
    });
};

exports.getWork = (user_id) => {
    let sql = "SELECT * FROM users_issues WHERE user_id = ?";
    connection.query(sql, [id], (error, results, fields) => {
        if(error) {
            throw error;
        } else {
            console.log(results);
            return results;
        }
    });
};

exports.insertWork = (user_id, issue_id, start, end) => {
    let sql = "INSERT INTO users_issues VALUES(?, ?, ?, ?)";
    connection.query(sql, [user_id, issue_id, start, end], (error, results, fields) => {
        if(error) {
            throw error;
        } else {
            console.log(results);
            return results;
        }
    });
};

exports.updateWork = (user_id, issue_id, old_start, start, end) => {
    let sql = "UPDATE users_issues SET start = ?, end = ? WHERE user_id = ?, issue_id = ?, start = ?";
    connection.query(sql, [start, end, user_id, issue_id, old_start], (error, results, fields) => {
        if(error) {
            throw error;
        } else {
            console.log(results);
            return results;
        }
    });
};
