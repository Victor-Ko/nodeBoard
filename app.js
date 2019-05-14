var express = require('express');
var path = require('path');

var app = express();

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));

app.listen(3000, () =>{
    console.log('server on!');
});

const data = {count: 0};

app.get('/', (req,res) => {
    data.count++;
    res.render('my_first_ejs', data);
});

app.get('/reset', (req,res) => {
    data.count = 0;
    res.render('my_first_ejs', data);
});

app.get('/set/count', (req,res) => {
    if(req.query.count){
        data.count = req.query.count;
    }
    res.render('my_first_ejs', data);
});

app.get('/set/:num', (req,res) => {
    data.count = req.params.num;
    res.render('my_first_ejs', data);
});