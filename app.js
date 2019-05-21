const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const flash = require("connect-flash");
const session = require("express-session");
const passport   = require("./config/passport");

const app = express();

// Other settings
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(flash());
app.use(session({secret:"MySecret", resave:true, saveUninitialized:true}));

// Passport
app.use(passport.initialize());
app.use(passport.session()); 

// Port setting
app.listen(3000, () =>{
    console.log('server on!');
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
db.on('error', () => {
    console.log('DB Error : ', err);
});

// Custom Middlewares
app.use((req,res,next) => {
    res.locals.isAuthenticated = req.isAuthenticated();
    res.locals.currentUser = req.user;
    next();
});

// Routes
app.use("/", require("./routes/home"));
app.use("/contacts", require("./routes/contacts"));
app.use("/posts", require("./routes/posts"));
app.use("/users", require("./routes/users"));

//https://www.a-mean-blog.com/
//https://cloud.mongodb.com/