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

app.put('/work/:user_id/:issue_id/:old_start/:start/:end', (req, res) => {
    console.log(req.params('user_id'));
    console.log(req.params('issue_id'));
    console.log(req.params('old_start'));
    console.log(req.params('start'));
    console.log(req.params('end'));
    db.updateWork(req.params('user_id'), req.params('issue_id'), req.params('old_start'), req.params('start'), req.params('end'), 	(result) => {
    	console.log(result);
        res.sendStatus(200);
	});

});

app.delete('/work/:user_id/:issue_id/:old_start', (req, res) => {
	console.log(req.params('user_id'));
	console.log(req.params('issue_id'));
	console.log(req.params('old_start'));
	db.deleteWork(req.params('user_id'), req.params('issue_id'), req.params('old_start'), (result) => {
		console.log(result);
		res.sendStatus(200);
	});
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

app.get('/settings', (req, res) => {
    res.render('settings');
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
