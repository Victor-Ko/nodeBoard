const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

const app = express();

// Other settings
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));

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

// Routes
app.use("/", require("./routes/home"));
app.use("/contacts", require("./routes/contacts"));