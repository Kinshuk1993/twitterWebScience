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
var logger = require('../logger-config/log-config');
//get keywor array
var keywordArray = require('../controller/keywords');

//Glasgow coordinates - Obtained using http://boundingbox.klokantech.com/
var glasgow = ['-4.393201', '55.781277', '-4.071717', '55.929638'];

/**
 * get a stream of glasgow tweets
 * with end point as statuses/filter
 */
var streamTwitterDataLocation = twitAuth.stream('statuses/filter', {
    locations: glasgow
});

exports.getTweetsSTREAMLocationFilter = function () {
    /**
     * logger to confirm that calling is happening as expected, but tweets not coming
     * in many executions of the code
     * at all from twitter due to restrictions
     */
    logger.info('Location filter stream started');
    //action on getting tweets from glasgow
    streamTwitterDataLocation.on('tweet', function (tweet) {
        //log the content to the log file with user name
        logger.info('Tweet from Glasgow received by user: ' + JSON.stringify(tweet.user.screen_name));
        //save the incoming tweet to the database
        TweetsDB.tweetsSTREAMLocationFilter(tweet).save(function (err, savedTweet) {
            //handle error case
            if (err) {
                //If error, log the error
                logger.error('Error occured in saving tweet by user ' + JSON.stringify(tweet.user.screen_name) + ' to database: ' + JSON.stringify(err));
            } else {
                //Log the success message of saving to database
                logger.info('Tweet by user ' + JSON.stringify(tweet.user.screen_name) + ' from Glasgow saved to database');
            }
        });
    });

    //action on getting limit messages on location stream
    streamTwitterDataLocation.on('limit', function (limitMessage) {
        //log the content to the log file
       logger.info('Limit message for location stream received: ' + JSON.stringify(limitMessage));
    });

    //action on getting disconnect messages on location stream
    streamTwitterDataLocation.on('disconnect', function (disconnectMessage) {
        //log the content to the log file
        logger.warn('Disconnect message for location stream received: ' + JSON.stringify(disconnectMessage));
    });

    //action on getting error messages on location stream
    streamTwitterDataLocation.on('error', function (errMsg) {
        //log the content to the log file
        logger.error('Error message for location stream received: ' + JSON.stringify(errMsg));
    });

    //stop the streaming of data after 1 hour
    setTimeout(stopLocationStream,3600000);
}

/**
 * Function to stop the streaming of
 * location data
 */
function stopLocationStream() {
    //log the action
    logger.info('Stopping the location stream.');
    //end location streaming
    streamTwitterDataLocation.stop();    
    //log stop success message
    logger.info('Location stream ended.');
};
