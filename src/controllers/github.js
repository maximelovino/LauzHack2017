const request = require('request');

const GITHUB_ID = "6e85086080f66fc74a25";
const GITHUB_SECRET = "424fa389d55ee395f3ad6870d9847730cecfbf3e";

exports.clientID = GITHUB_ID;

exports.getTokenAndStore = (req,res) => {
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
			console.log(body);
			const token = JSON.parse(body).access_token;
			req.session.access_token = token;
			res.redirect('/')
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
			console.log(body);
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
		console.log(`One page function url: ${url}`);
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
				console.log(response.headers.link);
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
		console.log(`One page function url: ${url}`);
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
				console.log(response.headers.link);
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
		console.log("We got the repos");
		//callbackForIssues(reposWithIssues);

		let issuesByRepo = [];

		function sendToCallback(){
			callbackForIssues(issuesByRepo);
		}

		for (var i = 0; i < reposWithIssues.length; i++) {
			getIssuesForARepo(req,i,reposWithIssues[i],(issues,j) => {
				console.log(`GOT THE ISSUES FOR ${j}`);
				issuesByRepo[j] = issues;
				if (issuesByRepo.filter(a => a !== undefined).length === reposWithIssues.length){
					sendToCallback()
				}
			});
		}
	}
	getRepos(req,fromRepos);
};
