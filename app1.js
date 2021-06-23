const express =require('express');
const app = express();
const fs = require('fs');
const path =require('path');
const fetch = require('node-fetch');
const qrcode = require('qrcode');
const session =require('express-session')
const venom = require('venom-bot');
const  MongoClient = require('mongodb').MongoClient;
const  MongoClient1 = require('mongodb').MongoClient;
const { Console, count } = require('console');
const bodyParser =require('body-parser');
const { connect, Logger } = require('mongodb');
const FileStore = require('session-file-store')(session);
const ObjectID = require('mongodb').ObjectID;
const dburl = "mongodb+srv://agish:agish@first.jxgwd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
var crypto = require('crypto');

const route =require('./routes/routes')

app.listen(8000);
app.set('view engine','ejs');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,'public')));
app.use(session({
    
    secret:'secret-key',
    resave: false,
    saveUninitialized: false
}));

app.use('/',route);
