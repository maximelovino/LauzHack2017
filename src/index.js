const express = require('express');
const app = express();
app.set('view engine','pug');

app.use('/material', express.static(__dirname + '/node_modules/material-components-web/dist/'));
app.use('/scripts', express.static(__dirname + '/scripts/'));
app.use('/css', express.static(__dirname + '/css/'));

app.get('/', (req,res) => {
	res.render('hello');
});


app.listen(3000, () => {
    console.log("Listening on http://localhost:3000");
});
