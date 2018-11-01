'use strict';

//require dependencies and inbuild files
var express = require('express');
var path = require('path');
var fs = require('fs');
var logDir = 'Twitter-Crawler-Logs';
var logFile = path.resolve(__dirname + "/" + logDir);
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var getTweets = require('./controller/getTweetsRouter');
var config = require('./model/config');
var logger = require('./logger-config/log-config');
var getTweetsUsingRest = require('./controller/restCall');
var keywordArray = require('./controller/keywords');

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
//call the REST API initially and then put it inside a callback loop
getTweetsUsingRest.getTweetsREST('love');

//call the REST API every 5 minutes for a total duration of 1 hour
var intervalForRestCall = setInterval(function () {
    var sampleArrayKeyword = []
    for (var i = 0; i < keywordArray.length; i++) {
        sampleArrayKeyword.push(keywordArray[i])
    }
    var randomKeyword = "";
    // then, each time pull from that array and remove the one you use
    if (sampleArrayKeyword.length > 0) {
        var randomIndex = Math.floor(Math.random() * sampleArrayKeyword.length)
        randomKeyword = sampleArrayKeyword[randomIndex];
        logger.info('Keyword being searched for in the twitter REST call is: ' + randomKeyword);
        sampleArrayKeyword.splice(randomIndex, 1);
    }
    getTweetsUsingRest.getTweetsREST(randomKeyword);
}, 300000);
setTimeout(function () {
    clearInterval(intervalForRestCall);
}, 3600000);

//listen the application at port number 3000
app.listen(3000, () => {
    logger.info('Starting the server at port number 3000');
});