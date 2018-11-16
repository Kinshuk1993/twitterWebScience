'use strict';

//get the tweets model
var TweetsDB = require('../model/tweetsSchema');
//include async module
var async = require('async');
//include logger config
var logger = require('../logger-config/log-config');
//include output file config
var output = require('../logger-config/finalOutput');
//require k-means module
var kmeans = require('node-kmeans');
var clustering = require('density-clustering');
//import python shell
let {
    PythonShell
} = require('python-shell');
//regex for removing the emojis from the text
var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
//all tweets array
var totalTweetsText = [];
var fullpath = __dirname;
var fs = require('fs');

exports.kMeansClustering = function () {
    async.waterfall([
        //1. Function to get all no filter tweets from database
        function (callback) {
            TweetsDB.tweetsSTREAMNoFilter.find({}, function (err, nofilterTweets) {
                if (err) {
                    //log the error
                    logger.error('kMeansClustering: Error in finding geo tweets in location filter stream collection: ' + err);
                    //continue to the next function
                    callback(null, totalTweetsText);
                } else {
                    async.forEachSeries(nofilterTweets, function (eachNoFilterTweet, callback) {
                            totalTweetsText.push(JSON.parse(JSON.stringify(eachNoFilterTweet)).text.replace(regex, ''));
                            callback();
                        },
                        function (errAsyncDuplicate) {
                            //handle error
                            if (errAsyncDuplicate) {
                                //log the error found
                                logger.error('kMeansClustering: Error in async for kMeansClustering 1: ' + errAsyncDuplicate);
                                //go to next function
                                callback(null, totalTweetsText);
                            } else {
                                //log the final output
                                logger.info('kMeansClustering: Going to function 2 to find rest tweets');
                                //go to next function
                                callback(null, totalTweetsText);
                            }
                        });
                }
            });
        },
        //2. Function to find all rest tweets from db
        function (totalTweetsText, callback) {
            TweetsDB.tweetsREST.find({}, function (err, restTweets) {
                if (err) {
                    //log the error
                    logger.error('kMeansClustering: Error in finding geo tweets in location filter stream collection: ' + err);
                    //continue to the next function
                    callback(null, totalTweetsText);
                } else {
                    async.forEachSeries(restTweets, function (eachRestTweet, callback) {
                            totalTweetsText.push(JSON.parse(JSON.stringify(eachRestTweet)).text.replace(regex, ''));
                            callback();
                        },
                        function (errAsyncDuplicate) {
                            //handle error
                            if (errAsyncDuplicate) {
                                //log the error found
                                logger.error('kMeansClustering: Error in async for kMeansClustering 2: ' + errAsyncDuplicate);
                                //go to next function
                                callback(null, totalTweetsText);
                            } else {
                                //log the final output
                                logger.info('kMeansClustering: Going to function 3 to find keyword filtered tweets');
                                //go to next function
                                callback(null, totalTweetsText);
                            }
                        });
                }
            });
        },
        //3. Function to find all keyword filtered tweets from db
        function (totalTweetsText, callback) {
            TweetsDB.tweetsSTREAMKeywordFilter.find({}, function (err, keywordTweets) {
                if (err) {
                    //log the error
                    logger.error('kMeansClustering: Error in finding geo tweets in location filter stream collection: ' + err);
                    //continue to the next function
                    callback(null, totalTweetsText);
                } else {
                    async.forEachSeries(keywordTweets, function (eachKeywordTweet, callback) {
                            totalTweetsText.push(JSON.parse(JSON.stringify(eachKeywordTweet)).text.replace(regex, ''));
                            callback();
                        },
                        function (errAsyncDuplicate) {
                            //handle error
                            if (errAsyncDuplicate) {
                                //log the error found
                                logger.error('kMeansClustering: Error in async for kMeansClustering 3: ' + errAsyncDuplicate);
                                //go to next function
                                callback(null, totalTweetsText);
                            } else {
                                //log the final output
                                logger.info('kMeansClustering: Going to function 4 to find geo tweets');
                                //go to next function
                                callback(null, totalTweetsText);
                            }
                        });
                }
            });
        },
        //4. Function to find all geo tweets from db
        function (totalTweetsText, callback) {
            TweetsDB.tweetsSTREAMLocationFilter.find({}, function (err, geoTweets) {
                if (err) {
                    //log the error
                    logger.error('kMeansClustering: Error in finding geo tweets in location filter stream collection: ' + err);
                    //continue to the next function
                    callback(null, totalTweetsText);
                } else {
                    async.forEachSeries(geoTweets, function (eachGeoTweet, callback) {
                            totalTweetsText.push(JSON.parse(JSON.stringify(eachGeoTweet)).text.replace(regex, ''));
                            callback();
                        },
                        function (errAsyncDuplicate) {
                            //handle error
                            if (errAsyncDuplicate) {
                                //log the error found
                                logger.error('kMeansClustering: Error in async for kMeansClustering 4: ' + errAsyncDuplicate);
                                //go to next function
                                callback(null, totalTweetsText);
                            } else {
                                //log the final output
                                logger.info('kMeansClustering: Going to function 5 to write data to file');
                                //go to next function
                                callback(null, totalTweetsText);
                            }
                        });
                }
            });
        },
        //5. Function to write data to file
        function (totalTweetsText, callback) {
            async.forEachSeries(totalTweetsText, function (eachTweetText, callback) {
                fs.appendFile(fullpath + '/tweetTexts.txt', eachTweetText, function (err, data) {
                    if (err) {
                        //if error in writing to file, log it
                        logger.error('Error writing file: ' + err);
                        //continue to next iteration
                        callback();
                    } else {
                        //next iteration
                        callback();
                    }
                });
            },
            function (errAsyncDuplicate) {
                //handle error
                if (errAsyncDuplicate) {
                    //log the error found
                    logger.error('kMeansClustering: Error in async for kMeansClustering 5: ' + errAsyncDuplicate);
                    //go to next function
                    callback(null, totalTweetsText);
                } else {

                    //log the final output
                    logger.info('kMeansClustering: Successfully written to file: Going to function 6 to execute python script');
                    //go to the next function to execute the python script for clustering
                    callback(null, totalTweetsText);
                }
            });
        },
        //6. Function to execute a python script
        function (totalTweetsText, callback) {
            var options = {
                mode: 'text',
                pythonOptions: ['-u'],
                scriptPath: fullpath,
            };
            //run the python script file with options
            PythonShell.run('minHash.py', options, function (err, result) {
                if (err) {
                    //log the error in running the python script
                    logger.error('Error in python: ' + err);
                    //go to next function
                    callback(null, totalTweetsText);
                } else {
                    //log the python script result
                    logger.info('Python result: ' + result);
                    //continue to next function
                    callback(null, totalTweetsText);
                }
            });
        }
        // //5. Function to perform K means on geo-tagged data
        // function (totalTweetsText, callback) {
        //     var vectors = new Array();
        //     for (var i = 0; i < totalTweetsText.length; i++) {
        //         // console.log(JSON.parse(JSON.stringify(geoTweets[i])).id_str)
        //         vectors[i] = [JSON.parse(JSON.stringify(totalTweetsText[i])).text.length, JSON.parse(JSON.stringify(totalTweetsText[i])).user.followers_count];
        //     }
        //     // kmeans.clusterize(vectors, {
        //     //     k: 20
        //     // }, (err, res) => {
        //     //     if (err) {
        //     //         console.log('Error: ' + err);
        //     //         callback(null, geoTweets.length);
        //     //     } else {
        //     //         console.log('%o', res);
        //     //         callback(null, geoTweets.length);
        //     //     }
        //     // });
        //     // var kMeans = new clustering.KMEANS();
        //     // // parameters: 3 - number of clusters
        //     // var clusters = kMeans.run(vectors, 35);
        //     // console.log(clusters);
        //     // callback(null, geoTweets.length);
        //     callback(null, totalTweetsText);
        // }

    ], function (err, result) {
        console.log('Final: ' + result.length);
    })
}


//remove k-means or density-clustering