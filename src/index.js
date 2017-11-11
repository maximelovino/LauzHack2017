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
		github.getConnectedUser(req,(user) => {
			github.getIssuesByRepo(req, (issuesByRep) => {
				db.getWork(user.id, (work) => {
                    console.log(user);
                    console.log(JSON.stringify(work));
                    let params = {
                        'user': user,
                        'repos': issuesByRep,
                        'work': JSON.stringify(work)
                    };
                    // console.log(params.work);
                    res.render('main', params);
				});

			})
		});
	}else{
		res.render('authenticate', {"clientID": github.clientID})
	}
});

app.get('/testsql', (req, res) => {
    db.getUser(0);
});

app.get('/thomas', (req,res) => {
	github.getConnectedUser(req,(user) => {
		github.getIssuesByRepo(req, (issuesByRep) => {
		    console.log(user);
			let params = {
				'user': user,
				'repos': issuesByRep
			};
			res.render('main', params);
		})
	});
});

app.get('/config', (req, res) => {
    res.render('config');
});

app.get('/user',(req,res) => {
    if (!req.session.access_token){
        console.log("NO TOKEN");
        res.redirect('/');
    }else{
        github.getConnectedUser(req,(body) => {
			res.contentType('application/json');
			res.send(body);
		});
    }
});

app.get('/repos', (req,res) => {
	if (!req.session.access_token){
        console.log("NO TOKEN");
        res.redirect('/');
    }else{
        github.getRepos(req,(body) => {
			res.contentType('application/json');
			res.send(body);
		});
    }
});

app.get('/issues', (req,res) => {
	if (!req.session.access_token){
		console.log("NO TOKEN");
		res.redirect('/');
	}else{
		github.getIssuesByRepo(req,(body) => {
			res.contentType('application/json');
			res.send(body);
		});
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
