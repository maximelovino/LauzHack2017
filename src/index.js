const express = require('express');
const request = require('request');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser');
//const mysqlSessionStore = require('express-mysql-session')(session);
const fs = require('fs');
const github = require('./controllers/github');
const db = require('./controllers/sql');
const bodyParser = require('body-parser');

app.set('view engine', 'pug');
app.set('view options', {"pretty":true});
app.locals.pretty = true;
app.use(bodyParser.urlencoded({extended: false}));
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
app.use('/assets',express.static(__dirname + '/assets/'));

app.get('/', (req, res) => {
	if (req.session.access_token){
		github.getConnectedUser(req,(user) => {
			github.getIssuesByRepo(req, (issuesByRep) => {
                db.insertUser(user.id);
				db.getWork(user.id, (work) => {
                    db.getUser(user.id, (userFromDB) => {
                        let params = {
                            'user': user,
							'userDB': JSON.stringify(userFromDB),
                            'repos': issuesByRep,
                            'work': JSON.stringify(work)
                        };
                        res.render('main', params);
					});
				});
			})
		});
	}else{
		res.render('authenticate', {"clientID": github.clientID})
	}
});

app.post('/work', (req, res) => {
    console.log(req.body.issue_id);
    console.log(req.body.start);
    console.log(req.body.end);
    github.getConnectedUser(req, (user) => {
    	console.log(user.id);
        db.insertWork(user.id, req.body.issue_id, req.body.start, req.body.end, (result) =>{
            console.log(result);
            res.sendStatus(200);
        });
	});

});

app.put('/work', (req, res) => {
    github.getConnectedUser(req, (user) => {
        db.updateWork(user.id, req.body.issue_id, req.body.old_start, req.body.start, req.body.end, (result) => {
            console.log(result);
            res.sendStatus(200);
        });
    });
});

app.delete('/work', (req, res) => {
	console.log(req.params);
    github.getConnectedUser(req, (user) => {
        db.deleteWork(user.id, req.body.issue_id, req.body.start, (result) => {
            console.log(result);
            res.sendStatus(200);
        });
    });

});

app.get('/settings', (req, res) => {
    if (!req.session.access_token){
    	res.redirect('/');
	}else{
		github.getConnectedUser(req,(user) => {
			db.getUser(user.id, (userFromDB) => {
				console.log(userFromDB);
				const userToSend = JSON.stringify(userFromDB);
				console.log(userToSend);
				res.render('settings', {'user':userToSend});
			});
		})
    }
});

app.post('/settings', (req,res) => {
	if(!req.session.access_token){
		res.redirect('/');
	}else{
		github.getConnectedUser(req, (user) => {
			const minTime = req.body.min;
			const maxTime = req.body.max;
			db.updateSettings(user.id, minTime, maxTime);
			res.redirect('/');
		})
	}
});
/*
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
});*/

app.get('/auth-callback', (req, res) => {
    github.getTokenAndStore(req,(token) => {
		req.session.access_token = token;
		res.redirect('/');
	});
});

app.listen(3000, () => {
    console.log("Listening on http://localhost:3000");
});
