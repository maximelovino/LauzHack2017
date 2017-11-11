const express = require('express');
const app = express();
const session = require('express-session');
const mysql = require('mysql');
const mysqlSessionStore = require('express-mysql-session')(session);

const GITHUB_ID = "6e85086080f66fc74a25";
const GITHUB_SECRET = "424fa389d55ee395f3ad6870d9847730cecfbf3e";

const DB_USER = "taskhub";
const DB_PASSWORD = "supertask";
const DB_NAME = "taskhub";

app.set('view engine', 'pug');

const mySQLOptions = {
    host: '192.33.206.63',
    port: 3306,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME,
};

var connection = mysql.createConnection(mySQLOptions);
var sessionStore = new mysqlSessionStore({}, connection);

app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    store: sessionStore,
    resave: false,
    saveUninitialized: false
}));

app.use('/material', express.static(__dirname + '/node_modules/material-components-web/dist/'));
app.use('/scripts', express.static(__dirname + '/scripts/'));
app.use('/css', express.static(__dirname + '/css/'));

app.get('/', (req, res) => {
    res.render('home', {"clientID": GITHUB_ID})
});

app.get('auth-callback', (req,res) => {
    res.render(JSON.stringify(req));
});


app.listen(3000, () => {
    console.log("Listening on http://localhost:3000");
});
