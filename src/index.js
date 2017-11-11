const express = require('express');
const request = require('request');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
//const mysqlSessionStore = require('express-mysql-session')(session);
const fs = require('fs');
const github = require('./controllers/github');
const db = require('./controllers/sql');

app.set('view engine', 'pug');
app.set('view options', {"pretty":true});
app.locals.pretty = true;


app.use(cookieParser());
app.use(session({
    key: 'session_cookie_name',
    secret: 'session_cookie_secret',
    resave: false,
    saveUninitialized: false
}));

app.use('/material', express.static(__dirname + '/node_modules/material-components-web/dist/'));
app.use('/scripts', express.static(__dirname + '/scripts/'));
app.use('/css', express.static(__dirname + '/css/'));
app.use('/fullcalendar', express.static(__dirname + '/node_modules/fullcalendar/dist/'));

app.get('/', (req, res) => {
	if (req.session.access_token){
		res.render('authenticated',{'token':req.session.access_token})
	}else{
		res.render('home', {"clientID": github.clientID})
	}
});

app.get('/testsql', (req, res) => {
    db.getUser(0);
});

app.get('/thomas', (req,res) => {
	const params = {
		USER_PICTURE_LINK: 'https://assets-cdn.github.com/images/modules/logos_page/Octocat.png',
		USER_NAME: 'TOTO',
		REPS: [{
			name:'repo 1',
			issues: [{name: 'issue 1'},{name: 'issue 2'}],
		},{
			name: 'repo 2',
			issues: [{name: 'issue 1'},{name: 'issue 2'}],
		}]
	};

	res.render('main', params);
});

app.get('/config', (req, res) => {
    res.render('config');
});

app.get('/user',(req,res) => {
    if (!req.session.access_token){
        console.log("NO TOKEN");
        res.redirect('/');
    }else{
        github.getConnectedUser(req,res);
    }
});

app.get('/randomData', (req, res) => {

});

app.get('/auth-callback', (req, res) => {
    github.getTokenAndStore(req,res);
});

app.listen(3000, () => {
    console.log("Listening on http://localhost:3000");
});
