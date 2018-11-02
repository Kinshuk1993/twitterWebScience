'use strict';

//require the twit module to enable REST and streaming calls to twitter apis
var twit = require('twit');
//get the tweets model
var TweetsDB = require('../model/tweetsSchema');
//get the consumer and access keys from JSON
var keys = require('./../access-key/access');
//build and provide the keys to imported twit variable
var twitAuth = new twit({
    consumer_key: keys.consumer_key,
    consumer_secret: keys.consumer_secret_key,
    access_token: keys.access_token,
    access_token_secret: keys.access_secret_token
});

//include async module
var async = require('async');
//include path module
var path = require('path');
//specify the log folder name
var logDir = 'Twitter-Crawler-Logs';
//get the log directory
var logFile = path.resolve(__dirname + "/" + logDir);
//include logger config
var logger = require('./../logger-config/log-config');
//get keywor array
var keywordArray = require('./../controller/keywords');

//Glasgow coordinates - Obtained using http://boundingbox.klokantech.com/
var glasgow = ['-4.393201', '55.781277', '-4.071717', '55.929638'];

/**
 * get a stream of glasgow tweets
 * with end point as statuses/filter
 */
var streamTwitterDataLocation = twitAuth.stream('statuses/filter', {
    locations: glasgow
});

/**
 * get a stream of tweets 
 * without any filter
 * with end point as statuses/sample
 */
var streamTwitterDataWithoutKeyword = twitAuth.stream('statuses/sample');

/**
 * get a stream of tweets containing the 
 * keywod from the keyword array
 * with end point as statuses/filter
 */
var streamTwitterDataKeyword = twitAuth.stream('statuses/filter', {
    track: keywordArray
});


exports.getTweetsSTREAM = function () {
    //action on getting tweets from glasgow
    streamTwitterDataLocation.on('tweet', function (tweet) {
        //log the content to the log file with user name
        logger.info('Tweet from Glasgow received by: ' + JSON.stringify(tweet.user.screen_name));
    });

    //action on getting limit messages on location stream
    streamTwitterDataLocation.on('limit', function (limitMessage) {
        //log the content to the log file
       logger.info('Limit message for location stream reeived: ' + JSON.stringify(limitMessage));
    });

    //action on getting disconnect messages on location stream
    streamTwitterDataLocation.on('disconnect', function (disconnectMessage) {
        //log the content to the log file
        logger.info('Disconnect message for location stream reeived: ' + JSON.stringify(disconnectMessage));
    });

    //action on getting error messages on location stream
    streamTwitterDataLocation.on('error', function (errMsg) {
        //log the content to the log file
        logger.error('Error message for location stream reeived: ' + JSON.stringify(errMsg));
    });

    //action on getting tweets using keywords filter stream
    streamTwitterDataKeyword.on('tweet', function (tweet) {
        //log the content to the log file with user name
        logger.info('Tweet with filter keyword received by: ' + JSON.stringify(tweet.user.screen_name));
    });

    //action on getting limit messages on keyword filter stream
    streamTwitterDataKeyword.on('limit', function (limitMessage) {
        //log the content to the log file
        logger.info('Limit message for keyword stream reeived: ' + JSON.stringify(limitMessage));
    });

    //action on getting disconnect messages on keyword filter stream
    streamTwitterDataKeyword.on('disconnect', function (disconnectMessage) {
        //log the content to the log file
        logger.info('Disconnect message for keyword stream reeived: ' + JSON.stringify(disconnectMessage));
    });

    //action on getting error messages on keyword filter stream
    streamTwitterDataKeyword.on('error', function (errMsg) {
        //log the content to the log file
        logger.error('Error message for keyword stream reeived: ' + JSON.stringify(errMsg));
    });

    //action on getting tweets from glasgow
    streamTwitterDataWithoutKeyword.on('tweet', function (tweet) {
        //log the content to the log file with user name
        logger.info('Tweet without any keyword filter received by: ' + JSON.stringify(tweet.user.screen_name));
    });

    //action on getting limit messages without any keyword filter stream
    streamTwitterDataWithoutKeyword.on('limit', function (limitMessage) {
        //log the content to the log file
       logger.info('Limit message for no keyword filter stream reeived: ' + JSON.stringify(limitMessage));
    });

    //action on getting disconnect messages without any keyword filter stream
    streamTwitterDataWithoutKeyword.on('disconnect', function (disconnectMessage) {
        //log the content to the log file
        logger.info('Disconnect message for no keyword filter stream reeived: ' + JSON.stringify(disconnectMessage));
    });

    //action on getting error messages without any keyword filter stream
    streamTwitterDataWithoutKeyword.on('error', function (errMsg) {
        //log the content to the log file
        logger.error('Error message for no keyword filter stream reeived: ' + JSON.stringify(errMsg));
    });

    //stop the streaming of data after 1 hour
    setTimeout(stopSTREAM,3600000);
}

/**
 * Function to stop the streaming of data
 */
function stopSTREAM() {
    //log the action
    logger.info('Streaming of twitter data test has now ended');
    //end location streaming
    streamTwitterDataLocation.stop();
    //end the keyword filter streaming
    streamTwitterDataKeyword.stop();
    //stop the no keyword filter stream
    streamTwitterDataWithoutKeyword.stop();
}