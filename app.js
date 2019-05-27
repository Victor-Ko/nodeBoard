const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const flash = require("connect-flash");
const session = require("express-session");
const passport = require("./config/passport");
const helmet = require('helmet');
const enforceSSL = require("express-enforces-ssl");
const ms = require("ms");
const https = require('https');
const fs = require('fs');
const cookieParser = require('cookie-parser');

const app = express();

// app.use에 함수를 넣은 것을 middleware
// app.use들 중에 위에 있는 것 부터 순서대로 실행
// Other settings
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(methodOverride("_method"));
// flash 초기화. req.flash라는 함수를 사용가능
app.use(flash());
// session은 서버에서 접속자를 구분시키는 역할
app.use(session({secret:"MySecret", resave:true, saveUninitialized:true}));
app.use(helmet());

app.enable("trust proxy");
app.use(enforceSSL());
app.use(helmet.hsts({
    maxAge: ms("1 year"),
    includeSubdomains: true
}));

const options = {
	key: fs.readFileSync('./keys/private.pem'),
	cert: fs.readFileSync('./keys/public.pem')
};

// Passport
app.use(passport.initialize());
app.use(passport.session()); 
// Custom Middlewares
app.use((req,res,next) => {
    //passport에서 제공하는 함수, 현재 로그인이 되어있는지 아닌지를 true,false로 return
    res.locals.isAuthenticated = req.isAuthenticated(); //로그인여부
    res.locals.currentUser = req.user; //로그인된 사용자 정보
    next();
});

// helmet
app.use(helmet.xssFilter());
app.use(helmet.frameguard("deny"));
app.use(helmet.noSniff());

app.disable("x-powered-by");
// Port setting
https.createServer(options, app).listen(3000, function() {
    console.log("HTTPS server listening on port https://localhost:" + 3000);
});

//DB Connection
/*
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb+srv://admin:admin@nodeboard-dgy1u.mongodb.net/test?retryWrites=true";
const client = new MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});
*/
mongoose.connect("mongodb+srv://admin:admin@nodeboard-dgy1u.mongodb.net/test?retryWrites=true", {useNewUrlParser:true});
const db = mongoose.connection;
db.once("open", () => {
    console.log('DB Connect');
});
db.on('error', (err) => {
    console.log('DB Error : ', err);
});

// Routes
app.use("/", require("./routes/home"));
app.use("/contacts", require("./routes/contacts"));
app.use("/posts", require("./routes/posts"));
app.use("/users", require("./routes/users"));

//https://www.a-mean-blog.com/
//https://cloud.mongodb.com/