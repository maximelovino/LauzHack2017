const mysql = require('mysql');

const DB_USER = "taskhub";
const DB_PASSWORD = "supertask";
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
            console.log(fields);
            return results;
        }
    });
};
