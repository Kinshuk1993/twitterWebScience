//require dependencies and inbuild files
var express = require('express');
var path = require('path');
var fs = require('fs');
var logDir = 'Twitter-Crawler-Logs';
var logFile = path.resolve(__dirname + "/" + logDir);
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var getTweets = require('./controller/getTweetsRouter');
var TweetsDB = require('./model/tweetsSchema');
var config = require('./model/config');
var logger = require('./logger-config/log-config');

if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

//initialize express
const app = express();

//Coonect to the mongo database
mongoose.connect(config.url, function (err) {
    if (err) {
        logger.error("Problem in connecting to the mongoDB database: " + JSON.stringify(err));
    }
    logger.info('Successfully connected to database');
});

//Middleware for bodyparsing using both json and urlencoding
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
// app.use(morgan('combined', { stream: winston.stream }));

/**
 * express.static is a built in middleware function to serve static files.
 * We are telling express server public folder is the place to look for the static files
 */
app.use(express.static(path.join(__dirname, 'public')));

//Routing all HTTP requests to /getTweets
app.use('/api/getTweets', getTweets);

/**
 * resond to http get method, first param is path
 * and then http request and response params
 * handle any unknown paths
 */
app.get('/*', (req, res) => {
    logger.info("Path not found error..!!");
    res.send("Page not Found Error");
});

//listen the application at port number 3000
app.listen(3000, () => {
    logger.info('Starting the server at port number 3000');
});