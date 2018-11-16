'use strict';

//get the tweets model
var TweetsDB = require('../model/tweetsSchema');
//include async module
var async = require('async');
//include logger config
var logger = require('../logger-config/log-config');
//include output file config
var output = require('../logger-config/finalOutput');
//regex for removing the emojis from the text
var regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g;
//all tweets array
var totalTweets = [];
//import minhash and lsh modules
var {
    Minhash,
    LshIndex
} = require('minhash');
//create object for lsh
var index = new LshIndex();

exports.kMeansClustering = function () {
    async.waterfall([
        //1. Function to get all no filter tweets from database
        function (callback) {
            TweetsDB.tweetsSTREAMNoFilter.find({}, function (err, nofilterTweets) {
                if (err) {
                    //log the error
                    logger.error('kMeansClustering: Error in finding geo tweets in location filter stream collection: ' + err);
                    //continue to the next function
                    callback(null, totalTweets);
                } else {
                    async.forEachSeries(nofilterTweets, function (eachNoFilterTweet, callback) {
                            var dataToWrite = {
                                'text': '',
                                'id': '',
                                'place': {}
                            };
                            dataToWrite.text = JSON.parse(JSON.stringify(eachNoFilterTweet)).text.replace(regex, '').toString();
                            dataToWrite.id = JSON.parse(JSON.stringify(eachNoFilterTweet)).id_str;
                            dataToWrite.place = JSON.parse(JSON.stringify(eachNoFilterTweet)).place;
                            totalTweets.push(dataToWrite);
                            callback();
                        },
                        function (errAsyncDuplicate) {
                            //handle error
                            if (errAsyncDuplicate) {
                                //log the error found
                                logger.error('kMeansClustering: Error in async for kMeansClustering 1: ' + errAsyncDuplicate);
                                //go to next function
                                callback(null, totalTweets);
                            } else {
                                //log the final output
                                logger.info('kMeansClustering: Going to function 2 to find rest tweets');
                                //go to next function
                                callback(null, totalTweets);
                            }
                        });
                }
            });
        },
        //2. Function to find all rest tweets from db
        function (totalTweets, callback) {
            TweetsDB.tweetsREST.find({}, function (err, restTweets) {
                if (err) {
                    //log the error
                    logger.error('kMeansClustering: Error in finding geo tweets in location filter stream collection: ' + err);
                    //continue to the next function
                    callback(null, totalTweets);
                } else {
                    async.forEachSeries(restTweets, function (eachRestTweet, callback) {
                            var dataToWrite = {
                                'text': '',
                                'id': '',
                                'place': {}
                            };
                            dataToWrite.text = JSON.parse(JSON.stringify(eachRestTweet)).text.replace(regex, '').toString();
                            dataToWrite.id = JSON.parse(JSON.stringify(eachRestTweet)).id_str;
                            dataToWrite.place = JSON.parse(JSON.stringify(eachRestTweet)).place;
                            totalTweets.push(dataToWrite);
                            callback();
                        },
                        function (errAsyncDuplicate) {
                            //handle error
                            if (errAsyncDuplicate) {
                                //log the error found
                                logger.error('kMeansClustering: Error in async for kMeansClustering 2: ' + errAsyncDuplicate);
                                //go to next function
                                callback(null, totalTweets);
                            } else {
                                //log the final output
                                logger.info('kMeansClustering: Going to function 3 to find keyword filtered tweets');
                                //go to next function
                                callback(null, totalTweets);
                            }
                        });
                }
            });
        },
        //3. Function to find all keyword filtered tweets from db
        function (totalTweets, callback) {
            TweetsDB.tweetsSTREAMKeywordFilter.find({}, function (err, keywordTweets) {
                if (err) {
                    //log the error
                    logger.error('kMeansClustering: Error in finding geo tweets in location filter stream collection: ' + err);
                    //continue to the next function
                    callback(null, totalTweets);
                } else {
                    async.forEachSeries(keywordTweets, function (eachKeywordTweet, callback) {
                            var dataToWrite = {
                                'text': '',
                                'id': '',
                                'place': {}
                            };
                            dataToWrite.text = JSON.parse(JSON.stringify(eachKeywordTweet)).text.replace(regex, '').toString();
                            dataToWrite.id = JSON.parse(JSON.stringify(eachKeywordTweet)).id_str;
                            dataToWrite.place = JSON.parse(JSON.stringify(eachKeywordTweet)).place;
                            totalTweets.push(dataToWrite);
                            callback();
                        },
                        function (errAsyncDuplicate) {
                            //handle error
                            if (errAsyncDuplicate) {
                                //log the error found
                                logger.error('kMeansClustering: Error in async for kMeansClustering 3: ' + errAsyncDuplicate);
                                //go to next function
                                callback(null, totalTweets);
                            } else {
                                //log the final output
                                logger.info('kMeansClustering: Going to function 4 to find geo tweets');
                                //go to next function
                                callback(null, totalTweets);
                            }
                        });
                }
            });
        },
        //4. Function to find all geo tweets from db
        function (totalTweets, callback) {
            TweetsDB.tweetsSTREAMLocationFilter.find({}, function (err, geoTweets) {
                if (err) {
                    //log the error
                    logger.error('kMeansClustering: Error in finding geo tweets in location filter stream collection: ' + err);
                    //continue to the next function
                    callback(null, totalTweets);
                } else {
                    async.forEachSeries(geoTweets, function (eachGeoTweet, callback) {
                            var dataToWrite = {
                                'text': '',
                                'id': '',
                                'place': {}
                            };
                            dataToWrite.text = JSON.parse(JSON.stringify(eachGeoTweet)).text.replace(regex, '').toString();
                            dataToWrite.id = JSON.parse(JSON.stringify(eachGeoTweet)).id_str;
                            dataToWrite.place = JSON.parse(JSON.stringify(eachGeoTweet)).place;
                            totalTweets.push(dataToWrite);
                            callback();
                        },
                        function (errAsyncDuplicate) {
                            //handle error
                            if (errAsyncDuplicate) {
                                //log the error found
                                logger.error('kMeansClustering: Error in async for kMeansClustering 4: ' + errAsyncDuplicate);
                                //go to next function
                                callback(null, totalTweets);
                            } else {
                                //log the final output
                                logger.info('kMeansClustering: Going to function 5 to form indexes using minhash lsh');
                                //go to next function
                                callback(null, totalTweets);
                            }
                        });
                }
            });
        },
        //5. Function to work with minhash lsh and create hashes and indexes
        function (totalTweets, callback) {
            var mArr = [];
            var count = 0;
            async.forEachSeries(totalTweets, function (each, callback) {
                    //create array of string
                    var textSplit = each.text.split();
                    //new variable
                    var m = 'm' + count;
                    //increment count for next variable
                    count++;
                    //new hashing
                    m = new Minhash();
                    //update each sentence
                    textSplit.map(function (w) {
                        m.update(w);
                    });
                    //add hashes to the index after updation
                    index.insert(each.id, m);
                    //add to m to late to compute closeness for each sentense
                    mArr.push(m);
                    //go to next iteration
                    callback();
                },
                //final function for async
                function (errFinal) {
                    if (errFinal) {
                        //log error
                        logger.error('Error in minhash calculation asynch final: ' + errFinal);
                        //go to next function
                        callback(null, totalTweets, mArr);
                    } else {
                        logger.info('kMeansClustering: Going to function 6 to form clusters using minhash lsh');
                        //go to next function
                        callback(null, totalTweets, mArr);
                    }
                });
        },
        //6. Function to perform query of lsh of each sentense
        function (totalTweets, mArr, callback) {
            //store all clusters for each sentence
            var allMatches = [];
            //loop through all indexes formed
            async.forEachSeries(mArr, function (eachM, callback) {
                    //find clusters
                    var match = index.query(eachM);
                    //form a cluster of arrays
                    allMatches.push(match);
                    //go to next index
                    callback();
                },
                //final function for async
                function (errFinal) {
                    if (errFinal) {
                        //log error
                        logger.error('Error matches in forming clusters based on minhash LSH: ' + errFinal);
                        //go to next function
                        callback(null, totalTweets);
                    } else {
                        //convert the arrays to JSON strings and use a Set to get unique values
                        var set = new Set(allMatches.map(JSON.stringify));
                        //convert back to array of arrays again
                        var allMatchesUnique = Array.from(set).map(JSON.parse);
                        //go to next function
                        callback(null, totalTweets);
                    }
                });
        }
    ], function (err, result) {
        console.log('End of the waterfall method: ' + result.length);
    })
}