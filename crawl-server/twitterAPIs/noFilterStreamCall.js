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

//include logger config
var logger = require('../logger-config/log-config');
//get keywor array
var keywordArray = require('../controller/keywords');

/**
 * get a stream of tweets 
 * without any filter
 * with end point as statuses/sample
 */
var streamTwitterDataWithoutKeyword = twitAuth.stream('statuses/sample');

// var Twitter = new TwitterStream(keys, false);

exports.getTweetsSTREAMNoFilter = function () {
    /**
     * logger to confirm that calling is happening as expected, but tweets not coming
     * in many executions of the code
     * at all from twitter due to restrictions
     */
    logger.info('No keyword filter stream started');
    //action on getting tweets from glasgow
    streamTwitterDataWithoutKeyword.on('tweet', function (tweet) {
        //log the content to the log file with user name
        logger.info('Tweet without any keyword filter received by user: ' + JSON.stringify(tweet.user.screen_name));
        //save the incoming tweet to the database
        TweetsDB.tweetsSTREAMNoFilter(tweet).save(function (err, savedTweet) {
            //handle error case
            if (err) {
                //If error, log the error
                logger.error('Error occured in saving tweet by user ' + JSON.stringify(tweet.user.screen_name) + ' with no filtering to database: ' + JSON.stringify(err));
            } else {
                //Log the success message of saving to database
                logger.info('Tweet by user ' + JSON.stringify(tweet.user.screen_name) + ' with no filtering saved to database');
            }
        });
    });

    //action on getting limit messages without any keyword filter stream
    streamTwitterDataWithoutKeyword.on('limit', function (limitMessage) {
        //log the content to the log file
        logger.info('Limit message for no keyword filter stream received: ' + JSON.stringify(limitMessage));
    });

    //action on getting disconnect messages without any keyword filter stream
    streamTwitterDataWithoutKeyword.on('disconnect', function (disconnectMessage) {
        //log the content to the log file
        logger.warn('Disconnect message for no keyword filter stream received: ' + JSON.stringify(disconnectMessage));
    });

    //action on getting error messages without any keyword filter stream
    streamTwitterDataWithoutKeyword.on('error', function (errMsg) {
        //log the content to the log file
        logger.error('Error message for no keyword filter stream received: ' + JSON.stringify(errMsg));
    });

    // stop the streaming of data after 1 hour
    // setTimeout(stopNoFilterStream, 3600000);
    //Done for small testing purpose to collect sample data of 5 Minutes
    setTimeout(stopNoFilterStream, 300000);
}

/**
 * Function to stop the streaming
 * of no filer data
 */
function stopNoFilterStream() {
    //log the action
    logger.info('Stopping the no filter stream.');
    //stop the no keyword filter stream
    streamTwitterDataWithoutKeyword.stop();
    //log stop success message
    logger.info('No filter stream ended.');
}