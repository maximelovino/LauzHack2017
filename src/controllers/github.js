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

exports.getConnectedUser = (req,res) => {
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
			res.contentType('application/json');
			res.send(body);
		} else {
			console.error("PROBLEM getting user");
			console.log(body);
			console.log(response);
		}
	});
};

exports.getRepos = (req,res) => {
	const requestOptions = {
		method: 'GET',
		uri: 'https://api.github.com/user/repos',
		headers:{
			'Authorization': `Bearer ${req.session.access_token}`,
            'User-agent': "Taskhub-app",
		}
	};

	request(requestOptions, (error, response, body) =>{
		if(!error && response.statusCode == 200){
			console.log(body);
			res.contentType('application/json');
			res.send(body);
		} else {
			console.error("PROBLEM getting repos");
			console.log(body);
			console.log(response);
		}
	});
}
