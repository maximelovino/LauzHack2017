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

let connection = mysql.createConnection(mySQLOptions);

exports.insertUser = (id) => {
	let sql = "INSERT INTO users (id) VALUES (?)";
	connection.query(sql,[id], (error, results, fields) => {
		if (error){
			console.log(`user ${id} already in db, or other problem`);
		}else{
			console.log(`user ${id} inserted in db`);
		}
	});
};

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

exports.getWork = (user_id, callback) => {
    let sql = "SELECT * FROM users_issues WHERE user_id = ?";
    connection.query(sql, [user_id], (error, results, fields) => {
        if(error) {
            throw error;
        } else {
            console.log(results);
            callback(results);
        }
    });
};

exports.insertWork = (user_id, issue_id, start, end, callback) => {
    let sql = "INSERT INTO users_issues VALUES(?, ?, ?, ?)";
    connection.query(sql, [user_id, issue_id, start, end], (error, results, fields) => {
        if(error) {
            throw error;
        } else {
            console.log(results);
            callback(results);
        }
    });
};

exports.updateWork = (user_id, issue_id, old_start, start, end, callback) => {
    let sql = "UPDATE users_issues SET start = ?, end = ? WHERE user_id = ? AND issue_id = ? AND start = ?";
    console.log([start, end, user_id, issue_id, old_start]);
    connection.query(sql, [start, end, user_id, issue_id, old_start], (error, results, fields) => {
        if(error) {
            throw error;
        } else {
            console.log(results);
            callback(results);
        }
    });
};

exports.deleteWork = (user_id, issue_id, old_start, callback) => {
    let sql = "DELETE FROM users_issues WHERE user_id = ? AND issue_id = ? AND start = ?";
    connection.query(sql, [user_id, issue_id, old_start], (error, results, fields) => {
        if(error) {
            throw error;
        } else {
            console.log(results);
            callback(results);
        }
    });
};
