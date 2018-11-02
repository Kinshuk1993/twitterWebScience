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

//export the methods
module.exports = {
    //function to find all tweets from database
    findAllRESTTweets: function (req, res) {
        //fun find command
        TweetsDB.tweetsREST.find((err, tweetList) => {
            //handle error scenario and return error code
            if (err) {
                logger.error('Error in finding in the database: ' + JSON.stringify(err));
                return handleError(res, err);
            } else { //handle success case of tweets found with response code and body
                logger.info('The number of tweets found  in the database using findAllTweets API are: ' + tweetList.length);
                //express deprecated res.send(status, body): Use res.status(status).send(body)
                //got to know from the exception of deprecated thrown while testing
                return res.status(200).send(tweetList);
            }
        })
    },

    //Function to save a new tweet to the database - SAMPLE
    saveNewTweetViaREST: function (req, res) {
        //build the tweet object to save
        var newTweet = new TweetsDB({
            user_id: req.body.user_id,
            tweet: req.body.tweet,
            geo_tagged: req.body.geo_tagged
        });
        //run the save command
        TweetsDB.tweetsREST(eachTweet).save(function (err, savedTweet) {
            //handle error scenario and return with not found error code
            if (err) {
                //log error on console
                logger.error('Error in saving new tweets to the database: ' + JSON.stringify(err));
                //return error
                return handleError(res, err);
            } else {
                //log success on console
                logger.info('New tweets saved to db: ' + JSON.stringify(savedTweet));
                //express deprecated res.send(status, body): Use res.status(status).send(body)
                //got to know from the exception of deprecated thrown while testing
                //return
                return res.status(200).send(savedTweet);
            }
        });
    },

    getTweetsREST: function (req, res) {
        twitAuth.get('search/tweets', {
            q: 'football', //query keyword
            count: 100 //setting the limit to maximum which is 100, but if not mentioned, default is 15
        }, function (err, data, response) {
            //handle the error in gathering the data from twitter and log error and exit
            if (err) {
                logger.error('Error occured in gathering twitter data: ' + JSON.stringify(err));
                return handleError(res, err);
            } else { //console the tweets received from twitter to console window
                logger.info('The number of tweets received using GET REST API are: ' + JSON.stringify(data.statuses.length));

                //save each tweet to the database by looping through the data received
                async.forEachSeries(data.statuses, function (eachTweet, callback) {
                        //save each tweet
                        TweetsDB.tweetsREST(eachTweet).save(function (err, savedTweet) {
                            //handle error case
                            if (err) {
                                //If error, log the error
                                logger.error('Error occured in saving incoming tweet to database: ' + JSON.stringify(err));
                                //continue to the next iteration
                                callback();
                            } else {
                                //continue to the next iteration
                                callback();
                            }
                        });
                    },
                    //final function to handle any other errors
                    function (err) {
                        //handle final error scenario
                        if (err) {
                            //if error, log error and return the response with error code
                            logger.error("Error in async of saving incoming tweets to database: " + JSON.stringify(err));
                            //return response
                            return handleError(res, err);
                        } else { //handle success case
                            //log success message
                            logger.info('All tweets successfully saved in the database.');
                            //return success code and custom message
                            return res.status(200).send('All tweets successfully saved in the database.');
                        }
                    });
            }
        });
    }
}

//function to handle the error response
function handleError(res, err) {
    logger.info("Error encountered in handleError: " + JSON.stringify(err));
    //return
    return res.send(500, err);
}