'use strict';

//get the tweets model
var TweetsDB = require('../model/tweetsSchema');
//include async module
var async = require('async');
//include logger config
var logger = require('../logger-config/log-config');
//include output file config
var output = require('../logger-config/finalOutput');

//variable to store total number of tweets collected using all calls
var totalTweetsCount = 0;
//variable to store the number of geo tagged tweets
var geoTaggedGlasgowTweets = 0;
//variable to store the number of geo-tagged tweets overall
var totalGeoTaggedTweets = 0;

exports.countGeoTaggedTweets = function () {
    TweetsDB.tweetsSTREAMLocationFilter.countDocuments({}, function (error, count) {
        if (error) {
            //log the error
            logger.error('Error in counting geo tagged tweets collected via location filter stream: ' + JSON.stringify(error));
        } else {
            //assign count to geoTaggedGlasgowTweets
            geoTaggedGlasgowTweets = count;
            //log the tweet count
            output.info("Number of geo tagged tweets collected using location filter stream: " + geoTaggedGlasgowTweets);
            logger.info("Number of geo tagged tweets collected using location filter stream: " + geoTaggedGlasgowTweets);
        }
    });
}

exports.countTotalTweetsCollected = function () {
    async.waterfall([
            //1. Count the number of tweets via rest API
            function (callback) {
                TweetsDB.tweetsREST.countDocuments({}, function (error, count) {
                    if (error) {
                        //log the error
                        logger.error('Error in counting tweets collected via REST API: ' + JSON.stringify(error));
                        //go to the next function in series
                        callback(null, totalTweetsCount, totalGeoTaggedTweets);
                    } else {
                        logger.info("Number of tweets collected using REST API: " + count);
                        //add count to the totalnumber of tweets
                        totalTweetsCount = totalTweetsCount + count;
                        //find the geo-tagged tweets from rest api calls and add to total
                        TweetsDB.tweetsREST.find({
                            "place": {
                                $ne: null
                            }
                        }, function (errFind, geoTaggedTweets) {
                            if (errFind) {
                                //log the error
                                logger.error('Error in finding tweets with place as not null for REST API calls: ' + errFind);
                                //go to the next function in series
                                callback(null, totalTweetsCount, totalGeoTaggedTweets);
                            } else {
                                //add geo tagged tweets collected via rest api calls to total geo-tagged tweets
                                totalGeoTaggedTweets = totalGeoTaggedTweets + geoTaggedTweets.length;
                                //go to the next function in series
                                callback(null, totalTweetsCount, totalGeoTaggedTweets);
                            }
                        });
                    }
                });
            },
            //2. Count the number of tweets via no filter stream
            function (totalTweetsCount, totalGeoTaggedTweets, callback) {
                TweetsDB.tweetsSTREAMNoFilter.countDocuments({}, function (error, count) {
                    if (error) {
                        //log the error
                        logger.error('Error in counting tweets collected via no filter stream: ' + JSON.stringify(error));
                        //go to the next function in series
                        callback(null, totalTweetsCount, totalGeoTaggedTweets);
                    } else {
                        logger.info("Number of tweets collected using no filter stream: " + count);
                        //add count to the totalnumber of tweets
                        totalTweetsCount = totalTweetsCount + count;
                        //find the geo-tagged tweets from no filter stream and add to total
                        TweetsDB.tweetsSTREAMNoFilter.find({
                            "place": {
                                $ne: null
                            }
                        }, function (errFind, geoTaggedTweets) {
                            if (errFind) {
                                //log the error
                                logger.error('Error in finding tweets with place as not null via no filter stream: ' + errFind);
                                //go to the next function in series
                                callback(null, totalTweetsCount, totalGeoTaggedTweets);
                            } else {
                                //add geo tagged tweets collected via no filter stream to total geo-tagged tweets
                                totalGeoTaggedTweets = totalGeoTaggedTweets + geoTaggedTweets.length;
                                //go to the next function in series
                                callback(null, totalTweetsCount, totalGeoTaggedTweets);
                            }
                        });
                    }
                });
            },
            //3. Count the number of tweets via keyword filter stream
            function (totalTweetsCount, totalGeoTaggedTweets, callback) {
                TweetsDB.tweetsSTREAMKeywordFilter.countDocuments({}, function (error, count) {
                    if (error) {
                        //log the error
                        logger.error('Error in counting tweets collected via keyword filter stream: ' + JSON.stringify(error));
                        //go to the next function in series
                        callback(null, totalTweetsCount, totalGeoTaggedTweets);
                    } else {
                        logger.info("Number of tweets collected using keyword filter stream: " + count);
                        //add count to the totalnumber of tweets
                        totalTweetsCount = totalTweetsCount + count;
                        //find the geo-tagged tweets from keyword filter stream and add to total
                        TweetsDB.tweetsSTREAMKeywordFilter.find({
                            "place": {
                                $ne: null
                            }
                        }, function (errFind, geoTaggedTweets) {
                            if (errFind) {
                                //log the error
                                logger.error('Error in finding tweets with place as not null via keyword filter stream: ' + errFind);
                                //go to the next function in series
                                callback(null, totalTweetsCount, totalGeoTaggedTweets);
                            } else {
                                //add geo tagged tweets collected via keyword filter stream to total geo-tagged tweets
                                totalGeoTaggedTweets = totalGeoTaggedTweets + geoTaggedTweets.length;
                                //go to the next function in series
                                callback(null, totalTweetsCount, totalGeoTaggedTweets);
                            }
                        });
                    }
                });
            },
            //4. Count the number of tweets via location filter stream
            function (totalTweetsCount, totalGeoTaggedTweets, callback) {
                TweetsDB.tweetsSTREAMLocationFilter.countDocuments({}, function (error, count) {
                    if (error) {
                        //log the error
                        logger.error('Error in counting tweets collected via location filter stream: ' + JSON.stringify(error));
                        //go to the next function in series
                        callback(null, totalTweetsCount, totalGeoTaggedTweets);
                    } else {
                        logger.info("Number of tweets collected using location filter stream: " + count);
                        //add count to the totalnumber of tweets
                        totalTweetsCount = totalTweetsCount + count;
                        //find the geo-tagged tweets from location filter stream and add to total
                        TweetsDB.tweetsSTREAMLocationFilter.find({
                            "place": {
                                $ne: null
                            }
                        }, function (errFind, geoTaggedTweets) {
                            if (errFind) {
                                //log the error
                                logger.error('Error in finding tweets with place as not null via location filter stream: ' + errFind);
                                //go to the next function in series
                                callback(null, totalTweetsCount, totalGeoTaggedTweets);
                            } else {
                                //add geo tagged tweets collected via location filter stream to total geo-tagged tweets
                                totalGeoTaggedTweets = totalGeoTaggedTweets + geoTaggedTweets.length;
                                //go to the next function in series
                                callback(null, totalTweetsCount, totalGeoTaggedTweets);
                            }
                        });
                    }
                });
            },
            //5. Function to create object for result and pass to final function
            function (totalTweetsCount, totalGeoTaggedTweets, callback) {
                //build a json object with all information to pass to final function
                var resultObj = {
                    totalTweets: totalTweetsCount,
                    totalGeoTweets: totalGeoTaggedTweets
                }
                //go to the next function in series
                callback(null, resultObj);
            }
        ],
        //FINAL FUNCTION after all functions above has executed
        function (err, result) {
            // console.log('Final result: ' + JSON.stringify(result));
            //log the total tweet counted overall
            output.info('Total number of tweets collected using REST and STREAM are: ' + result.totalTweets);
            logger.info('Total number of tweets collected using REST and STREAM are: ' + result.totalTweets);
            //log the total geo-tagged tweets overall
            output.info('Total number of geo-tagged tweets collected using REST and STREAM are: ' + result.totalGeoTweets);
            logger.info('Total number of geo-tagged tweets collected using REST and STREAM are: ' + result.totalGeoTweets);
        });
}