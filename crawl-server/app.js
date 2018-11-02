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
//for rest calls
var getTweetsUsingREST = require('./twitterAPIs/restCall');
//for streaming calls
var getTweetsUsingSTREAM = require('./twitterAPIs/streamCall');
//get keywor array
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
getTweetsUsingREST.getTweetsREST('amazing');

//get twitter data using streaming API
getTweetsUsingSTREAM.getTweetsSTREAM();

// call the REST API every 5 minutes for a total duration of 1 hour
var intervalForRestCall = setInterval(function () {
    //work on a sample array as JS will modify original array otherwise
    var sampleArrayKeyword = []
    //fill data into sample array
    for (var i = 0; i < keywordArray.length; i++) {
        sampleArrayKeyword.push(keywordArray[i])
    }
    //variable to store the random keyword to search for using REST call
    //defaulted to keyword "WEATHER"
    var randomKeyword = "weather";
    //each time pull from that array and remove the one already used
    //simple check to check if contents of array
    if (sampleArrayKeyword.length > 0) {
        //get a random index of sample array
        var randomIndex = Math.floor(Math.random() * sampleArrayKeyword.length)
        //get word on the generated index
        randomKeyword = sampleArrayKeyword[randomIndex];
        //log the action
        logger.info('Keyword being searched for via the twitter REST call is: ' + randomKeyword);
        //remove the word from the array to avoid duplicate keyword search using REST call
        sampleArrayKeyword.splice(randomIndex, 1);
    }
    //REST call using the random keyword from array
    getTweetsUsingREST.getTweetsREST(randomKeyword);
}, 300000);

//set the time after which the REST API calls should stop (1 hour)
setTimeout(function () {
    clearInterval(intervalForRestCall);
}, 3600000);

//listen the application at port number 3000
app.listen(3000, () => {
    logger.info('Starting the server at port number 3000');
});