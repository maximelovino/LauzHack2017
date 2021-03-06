const request = require('request');
require('dotenv').config({path: "github.env"});

const GITHUB_ID = process.env.GITHUB_ID;
const GITHUB_SECRET = process.env.GITHUB_SECRET;

exports.clientID = GITHUB_ID;

exports.getTokenAndStore = (req,callback) => {
	const githubCode = req.query.code;

	const requestOptions = {
		method: 'POST',
		uri: 'https://github.com/login/oauth/access_token',
		form: {
			"client_id": GITHUB_ID,
			"client_secret": GITHUB_SECRET,
			"code": githubCode
		},
		headers: {
			accept:'application/json'
		}
	};

	request(requestOptions,(error,response,body) => {
		if (!error && response.statusCode == 200) {
			const token = JSON.parse(body).access_token;
			callback(token);
		} else {
			console.error("PROBLEM getting the token");
		}
	});
};

exports.getConnectedUser = (req,callback) => {
	const requestOptions = {
		method: 'GET',
		uri: 'https://api.github.com/user',
		headers:{
			'Authorization': `Bearer ${req.session.access_token}`,
			'User-agent': "Taskhub-app",
		}
	};

	request(requestOptions, (error, response, body) =>{
		if(!error && response.statusCode == 200){
			callback(JSON.parse(body));
		} else {
			console.error("PROBLEM getting user");
			console.log(body);
			console.log(response);
		}
	});
};

function getRepos(req,callbackForRepos){
	let repos = [];

	function getOnePage(url, callback){
		const requestOptions = {
			method: 'GET',
			uri: url,
			headers:{
				'Authorization': `Bearer ${req.session.access_token}`,
				'User-agent': "Taskhub-app",
			}
		};

		request(requestOptions, function(error, response, body) {
			if(!error && response.statusCode == 200){

				let rep = JSON.parse(body);
				repos = [...repos,...rep];
				if (response.headers.link){
					const nextUrl = response.headers.link.split(',')[0].split(';')[0].slice(1, -1);
					const rel = response.headers.link.split(',')[0].split(';')[1].split('=')[1].slice(1,-1);
					if (rel === "next")
						getOnePage(nextUrl,callback);
					else
						callback();
				}else{
					callback();
				}
			}else{
				console.log("ERROR getting repo page");
				callback();
			}
		});

	}

	function sendToCallback() {
		callbackForRepos(repos);
	}


	const firstLink = "https://api.github.com/user/repos";
	getOnePage(firstLink, sendToCallback);
}

exports.getRepos = getRepos;


function getIssuesForARepo(req, i, repo, callBackForIssuesForRepo){
	let issues = [];

	function getOnePage(url, callback){
		const requestOptions = {
			method: 'GET',
			uri: url,
			headers:{
				'Authorization': `Bearer ${req.session.access_token}`,
				'User-agent': "Taskhub-app",
			}
		};

		request(requestOptions, function(error, response, body) {
			if(!error && response.statusCode == 200){

				let iss = JSON.parse(body);
				issues = [...issues,...iss];
				if (response.headers.link){
					const nextUrl = response.headers.link.split(',')[0].split(';')[0].slice(1, -1);
					const rel = response.headers.link.split(',')[0].split(';')[1].split('=')[1].slice(1,-1);
					if (rel === "next")
						getOnePage(nextUrl,callback);
					else
						callback();
				}else{
					callback();
				}
			}else{
				console.log("ERROR getting issue page");
				callback();
			}
		});

	}

	function sendToCallback() {
		callBackForIssuesForRepo({'repo': repo,'issues':issues},i);
	}

	const firstLink = `https://api.github.com/repos/${repo.full_name}/issues`;
	getOnePage(firstLink, sendToCallback);
}


exports.getIssuesByRepo = (req, callbackForIssues) => {
	function fromRepos(repos){
		let reposWithIssues = repos.filter(r => r.open_issues !== 0);
		//callbackForIssues(reposWithIssues);

		let issuesByRepo = [];

		function sendToCallback(){
			callbackForIssues(issuesByRepo);
		}

		for (var i = 0; i < reposWithIssues.length; i++) {
			getIssuesForARepo(req,i,reposWithIssues[i],(issues,j) => {
				issuesByRepo[j] = issues;
				if (issuesByRepo.filter(a => a !== undefined).length === reposWithIssues.length){
					sendToCallback()
				}
			});
		}
	}
	getRepos(req,fromRepos);
};

exports.postUselessData = (req,callback) => {
    const requestOptions = {
        method: 'POST',
        uri: 'https://api.github.com/repos/maximelovino/LauzHack2017/issues',
        headers:{
            'Authorization': `Bearer ${req.session.access_token}`,
            'User-agent': "Taskhub-app",
        },
		body :JSON.stringify({
        	"title": "teferst",
			"body": "yo idfst's a test",
		})
    };

    request(requestOptions, (error, response, body) =>{
        if(!error && response.statusCode == 200){
            callback(JSON.parse(body));
        } else {
            console.error("PROBLEM post useless data");
            console.log(body);
            console.log(response);
        }
    });
};
