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
//variable to store the number of overlap data between location and no filter streamed data
var totalOverlapTweetsLocationNoFilterStream = 0;
//variable to store total redundant data in all collections
var totalRedundantTweetsInCollections = 0;
//variable to store count of retweeted tweets
var totalRetweetedTweets = 0;
//variable to store the count of quote tweets
var totalQuoteTweets = 0;

exports.totalRetweetsQuotesCount = function () {
    async.waterfall([
            //1. Count the number of retweets via rest API
            function (callback) {
                TweetsDB.tweetsREST.find({}, function (err, tweets) {
                    if (err) {
                        //log the error
                        logger.error('totalRetweetsQuotesCount: ERROR in finding tweets for finding retweets in REST collection: ' + JSON.stringify(err));
                        //continue to the next function
                        callback(null, totalRetweetedTweets);
                    } else {
                        async.forEachSeries(tweets, function (eachTweet, callback) {
                                var subStringForRT = JSON.parse(JSON.stringify(eachTweet)).text.substring(0, 2);
                                if (subStringForRT === "RT") {
                                    //increment retweeted tweets
                                    totalRetweetedTweets = totalRetweetedTweets + 1;
                                    //continue to the next function
                                    callback();
                                } else {
                                    //if no retweet found, go to next tweet in collection
                                    callback();
                                }
                            },
                            function (errFinal) {
                                if (errFinal) {
                                    //log the error
                                    logger.error('ERROR in async of finding retweets in REST collection: ' + JSON.stringify(errFinal));
                                    // continue to the next function
                                    callback(null, totalRetweetedTweets);
                                } else {
                                    // continue to the next function
                                    callback(null, totalRetweetedTweets);
                                }
                            });
                    }
                });
            },
            //2. Count the number of quotes via REST API
            function (totalRetweetedTweets, callback) {
                TweetsDB.tweetsREST.find({
                    'is_quote_status': true
                }, function (err, quotedTweets) {
                    if (err) {
                        //log the error
                        logger.error('totalRetweetsQuotesCount: ERROR in finding quote tweets in REST API collection: ' + JSON.stringify(err));
                        //continue to the next function
                        callback(null, retweetedTweets, totalQuoteTweets);
                    } else {
                        if (quotedTweets.length != 0) {
                            //log the overlap success found message only if any overlap tweet found
                            logger.info('totalRetweetsQuotesCount: Quote tweets found in REST colletion: ' + quotedTweets.length);
                            //add quote tweets
                            totalQuoteTweets = totalQuoteTweets + quotedTweets.length;
                            //continue to the next function
                            callback(null, totalRetweetedTweets, totalQuoteTweets);
                        } else {
                            //log the overlap not found message iff no quote tweet found
                            logger.info('totalRetweetsQuotesCount: No quote tweets found in REST collection.');
                            //continue to the next function
                            callback(null, totalRetweetedTweets, totalQuoteTweets);
                        }
                    }
                });
            },
            //3. Count the number of retweets via keyword filter stream
            function (totalRetweetedTweets, totalQuoteTweets, callback) {
                TweetsDB.tweetsSTREAMKeywordFilter.find({}, function (err, tweets) {
                    if (err) {
                        //log the error
                        logger.error('totalRetweetsQuotesCount: ERROR in finding tweets for finding retweets in keyword filter collection: ' + JSON.stringify(err));
                        //continue to the next function
                        callback(null, totalRetweetedTweets, totalQuoteTweets);
                    } else {
                        async.forEachSeries(tweets, function (eachTweet, callback) {
                                var subStringForRT = JSON.parse(JSON.stringify(eachTweet)).text.substring(0, 2);
                                if (subStringForRT === "RT") {
                                    //increment retweeted tweets
                                    totalRetweetedTweets = totalRetweetedTweets + 1;
                                    //continue to the next function
                                    callback();
                                } else {
                                    //if no retweet found, go to next tweet in collection
                                    callback();
                                }
                            },
                            function (errFinal) {
                                if (errFinal) {
                                    //log the error
                                    logger.error('ERROR in async of finding retweets in keyword filter collection: ' + JSON.stringify(errFinal));
                                    // continue to the next function
                                    callback(null, totalRetweetedTweets, totalQuoteTweets);
                                } else {
                                    // continue to the next function
                                    callback(null, totalRetweetedTweets, totalQuoteTweets);
                                }
                            });
                    }
                });
            },
            //4. Count the number of quotes via keyword filter stream
            function (totalRetweetedTweets, totalQuoteTweets, callback) {
                TweetsDB.tweetsSTREAMKeywordFilter.find({
                    'is_quote_status': true
                }, function (err, quotedTweets) {
                    if (err) {
                        //log the error
                        logger.error('totalRetweetsQuotesCount: ERROR in finding quote tweets in keyword filter stream collection: ' + JSON.stringify(err));
                        //continue to the next function
                        callback(null, retweetedTweets, totalQuoteTweets);
                    } else {
                        if (quotedTweets.length != 0) {
                            //log the success found message only if any quoted tweets found
                            logger.info('totalRetweetsQuotesCount: Quote tweets found in keyword filter stream colletion: ' + quotedTweets.length);
                            //add quote tweets
                            totalQuoteTweets = totalQuoteTweets + quotedTweets.length;
                            //continue to the next function
                            callback(null, totalRetweetedTweets, totalQuoteTweets);
                        } else {
                            //log not found message iff no quote tweet found
                            logger.info('totalRetweetsQuotesCount: No quote tweets found in keyword filter stream collection.');
                            //continue to the next function
                            callback(null, totalRetweetedTweets, totalQuoteTweets);
                        }
                    }
                });
            },
            //5. Count the number of retweets via no filter stream
            function (totalRetweetedTweets, totalQuoteTweets, callback) {
                TweetsDB.tweetsSTREAMNoFilter.find({}, function (err, tweets) {
                    if (err) {
                        //log the error
                        logger.error('totalRetweetsQuotesCount: ERROR in finding tweets for finding retweets in no filter collection: ' + JSON.stringify(err));
                        //continue to the next function
                        callback(null, totalRetweetedTweets, totalQuoteTweets);
                    } else {
                        async.forEachSeries(tweets, function (eachTweet, callback) {
                                var subStringForRT = JSON.parse(JSON.stringify(eachTweet)).text.substring(0, 2);
                                if (subStringForRT === "RT") {
                                    //increment retweeted tweets
                                    totalRetweetedTweets = totalRetweetedTweets + 1;
                                    //continue to the next function
                                    callback();
                                } else {
                                    //if no retweet found, go to next tweet in collection
                                    callback();
                                }
                            },
                            function (errFinal) {
                                if (errFinal) {
                                    //log the error
                                    logger.error('ERROR in async of finding retweets in no filter collection: ' + JSON.stringify(errFinal));
                                    // continue to the next function
                                    callback(null, totalRetweetedTweets, totalQuoteTweets);
                                } else {
                                    // continue to the next function
                                    callback(null, totalRetweetedTweets, totalQuoteTweets);
                                }
                            });
                    }
                });
            },
            //6. Count the number of quotes via no filter stream
            function (totalRetweetedTweets, totalQuoteTweets, callback) {
                TweetsDB.tweetsSTREAMNoFilter.find({
                    'is_quote_status': true
                }, function (err, quotedTweets) {
                    if (err) {
                        //log the error
                        logger.error('totalRetweetsQuotesCount: ERROR in finding quote tweets in no filter stream collection: ' + err);
                        //continue to the next function
                        callback(null, retweetedTweets, totalQuoteTweets);
                    } else {
                        if (quotedTweets.length != 0) {
                            //log the overlap success found message only if any overlap tweet found
                            logger.info('totalRetweetsQuotesCount: Quote tweets found in no filter stream colletion: ' + quotedTweets.length);
                            //add quote tweets
                            totalQuoteTweets = totalQuoteTweets + quotedTweets.length;
                            //continue to the next function
                            callback(null, totalRetweetedTweets, totalQuoteTweets);
                        } else {
                            //log the overlap not found message iff no quote tweet found
                            logger.info('totalRetweetsQuotesCount: No quote tweets found in no filter stream collection.');
                            //continue to the next function
                            callback(null, totalRetweetedTweets, totalQuoteTweets);
                        }
                    }
                });
            },
            //7. Count the number of retweets via location filter stream
            function (totalRetweetedTweets, totalQuoteTweets, callback) {
                TweetsDB.tweetsSTREAMLocationFilter.find({}, function (err, tweets) {
                    if (err) {
                        //log the error
                        logger.error('totalRetweetsQuotesCount: ERROR in finding tweets for finding retweets in location filter collection: ' + JSON.stringify(err));
                        //continue to the next function
                        callback(null, totalRetweetedTweets, totalQuoteTweets);
                    } else {
                        async.forEachSeries(tweets, function (eachTweet, callback) {
                                var subStringForRT = JSON.parse(JSON.stringify(eachTweet)).text.substring(0, 2);
                                if (subStringForRT === "RT") {
                                    //increment retweeted tweets
                                    totalRetweetedTweets = totalRetweetedTweets + 1;
                                    //continue to the next function
                                    callback();
                                } else {
                                    //if no retweet found, go to next tweet in collection
                                    callback();
                                }
                            },
                            function (errFinal) {
                                if (errFinal) {
                                    //log the error
                                    logger.error('ERROR in async of finding retweets in location filter collection: ' + JSON.stringify(errFinal));
                                    // continue to the next function
                                    callback(null, totalRetweetedTweets, totalQuoteTweets);
                                } else {
                                    // continue to the next function
                                    callback(null, totalRetweetedTweets, totalQuoteTweets);
                                }
                            });
                    }
                });
            },
            //8. Count the number of quotes via location filter stream
            function (totalRetweetedTweets, totalQuoteTweets, callback) {
                TweetsDB.tweetsSTREAMLocationFilter.find({
                    'is_quote_status': true
                }, function (err, quotedTweets) {
                    if (err) {
                        //log the error
                        logger.error('totalRetweetsQuotesCount: ERROR in finding quote tweets in location filter stream collection: ' + JSON.stringify(err));
                        //continue to the next function
                        callback(null, retweetedTweets, totalQuoteTweets);
                    } else {
                        if (quotedTweets.length != 0) {
                            //log the overlap success found message only if any overlap tweet found
                            logger.info('totalRetweetsQuotesCount: Quote tweets found in location filter stream colletion: ' + quotedTweets.length);
                            //add quote tweets
                            totalQuoteTweets = totalQuoteTweets + quotedTweets.length;
                            //continue to the next function
                            callback(null, totalRetweetedTweets, totalQuoteTweets);
                        } else {
                            //log the overlap not found message iff no quote tweet found
                            logger.info('totalRetweetsQuotesCount: No quote tweets found location filter stream REST collection.');
                            //continue to the next function
                            callback(null, totalRetweetedTweets, totalQuoteTweets);
                        }
                    }
                });
            },
            // 9. Function to build and object to pass to final function to log the output
            function (totalRetweetedTweets, totalQuoteTweets, callback) {
                var finalObj = {
                    totalRetweets: totalRetweetedTweets,
                    totalQuotedTweets: totalQuoteTweets
                }
                callback(null, finalObj);
            }
        ],
        //FINAL FUNCTION after all functions above has executed
        function (err, result) {
            //log the final result of retweets and quotes found
            logger.info('Total retweeted tweets present in all the collections is: ' + result.totalRetweets);
            logger.info('Total quoted tweets present in all the collections is: ' + result.totalQuotedTweets);
            output.info('Total retweeted tweets present in all the collections is: ' + result.totalRetweets);
            output.info('Total quoted tweets present in all the collections is: ' + result.totalQuotedTweets);
        });
}

exports.totalRedundantDataInCollections = function () {
    /**
     * Query to find the total data in location filtered stream
     * and check if any data matches to any other data in other
     * collections or not
     */
    TweetsDB.tweetsSTREAMLocationFilter.find({}, function (errFind, tweets) {
        if (errFind) {
            //log the error
            logger.error('totalRedundantDataInCollections: ERROR in finding all location streamed data: ' + errFind);
        } else {
            //log the tweets array length found
            logger.info('totalRedundantDataInCollections: Number of tweets from Glasgow using streaming are: ' + tweets.length);
            async.waterfall([
                    //1. Count the number of tweets via rest API
                    function (callback) {
                        //loop through each location based tweet and find if any tweet is present in the no filtered streamed data
                        async.forEachSeries(tweets, function (eachGlasgowTweet, callback) {
                                TweetsDB.tweetsSTREAMNoFilter.find({
                                    'id_str': JSON.parse(JSON.stringify(eachGlasgowTweet)).id_str
                                }, function (err, duplicateTweet) {
                                    if (err) {
                                        //log the error
                                        logger.error('totalRedundantDataInCollections: ERROR in finding in no filter stream collection: ' + err);
                                        //continue to the next iteration
                                        callback();
                                    } else {
                                        if (duplicateTweet.length != 0) {
                                            //log the overlap success found message only if any overlap tweet found
                                            logger.info('totalRedundantDataInCollections: Duplicate tweet found between location and no filter stream: ' + duplicateTweet.length);
                                            //increment the length of the total duplicate tweets
                                            totalRedundantTweetsInCollections = totalRedundantTweetsInCollections + duplicateTweet.length;
                                            //continue to next iteration
                                            callback();
                                        } else {
                                            //log the overlap not found message iff no overlap tweet found
                                            // logger.info('totalRedundantDataInCollections: No duplicate record found between location streamed and no filter streamed data');
                                            //continue to next iteration as no overlap found for current eachGlasgowTweet.id_str
                                            callback();
                                        }
                                    }
                                });
                            },
                            //final param of forEachSeries to print the final number of duplicate data between location and no stream filter data    
                            function (errAsyncDuplicate) {
                                //handle error
                                if (errAsyncDuplicate) {
                                    //log the error found
                                    logger.error('totalRedundantDataInCollections: ERROR in async for finding overlap between location and no filter stream data: ' + errAsyncDuplicate);
                                    //go to next function
                                    callback(null, totalRedundantTweetsInCollections);
                                } else {
                                    //log the final output
                                    logger.info('totalRedundantDataInCollections: Going to find data duplicate between location filtered data and REST API data');
                                    //go to next function
                                    callback(null, totalRedundantTweetsInCollections);
                                }
                            });
                    },
                    //2. Count the duplicate data between location filtered and REST API data
                    function (totalRedundantTweetsInCollections, callback) {
                        //loop through each location based tweet and find if any tweet is present in the REST API data
                        async.forEachSeries(tweets, function (eachGlasgowTweet, callback) {
                                TweetsDB.tweetsREST.find({
                                    'id_str': JSON.parse(JSON.stringify(eachGlasgowTweet)).id_str
                                }, function (err, duplicateTweet) {
                                    if (err) {
                                        //log the error
                                        logger.error('totalRedundantDataInCollections: ERROR in finding duplicate in REST API collection: ' + err);
                                        //continue to the next iteration
                                        callback();
                                    } else {
                                        if (duplicateTweet.length != 0) {
                                            //log the success found message only if a duplicate tweet found
                                            logger.info('totalRedundantDataInCollections: Duplicate tweet found between location and REST API data: ' + duplicateTweet.length);
                                            //increment the length of the total duplicate tweets
                                            totalRedundantTweetsInCollections = totalRedundantTweetsInCollections + duplicateTweet.length;
                                            //continue to next iteration
                                            callback();
                                        } else {
                                            //log the overlap not found message iff no overlap tweet found
                                            // logger.info('totalRedundantDataInCollections: No duplicate record found between location streamed and REST API data');
                                            //continue to next iteration as no overlap found for current eachGlasgowTweet.id_str
                                            callback();
                                        }
                                    }
                                });
                            },
                            //final param of forEachSeries to print the final number of duplicate data between location and REST API data    
                            function (errAsyncDuplicate) {
                                //handle error
                                if (errAsyncDuplicate) {
                                    //log the error found
                                    logger.error('totalRedundantDataInCollections: ERROR in async for finding overlap between location and REST API data: ' + errAsyncDuplicate);
                                    //go to next function
                                    callback(null, totalRedundantTweetsInCollections);
                                } else {
                                    //log the final output
                                    logger.info('totalRedundantDataInCollections: Going to find data duplicate between location filtered data and keyword filtered stream data');
                                    //go to next function
                                    callback(null, totalRedundantTweetsInCollections);
                                }
                            });
                    },
                    //3. Count the number of duplicate tweets between location filtered stream and keyword filter stream
                    function (totalRedundantTweetsInCollections, callback) {
                        //loop through each location based tweet and find if any tweet is present in keyword filtered stream data
                        async.forEachSeries(tweets, function (eachGlasgowTweet, callback) {
                                TweetsDB.tweetsSTREAMKeywordFilter.find({
                                    'id_str': JSON.parse(JSON.stringify(eachGlasgowTweet)).id_str
                                }, function (err, duplicateTweet) {
                                    if (err) {
                                        //log the error
                                        logger.error('totalRedundantDataInCollections: ERROR in finding duplicate in keyword filtered stream data collection: ' + err);
                                        //continue to the next iteration
                                        callback();
                                    } else {
                                        if (duplicateTweet.length != 0) {
                                            //log the success found message only if a duplicate tweet found
                                            logger.info('totalRedundantDataInCollections: Duplicate tweet found between location and keyword filtered stream data: ' + duplicateTweet.length);
                                            //increment the length of the total duplicate tweets
                                            totalRedundantTweetsInCollections = totalRedundantTweetsInCollections + duplicateTweet.length;
                                            //continue to next iteration
                                            callback();
                                        } else {
                                            //log the overlap not found message iff no overlap tweet found
                                            // logger.info('totalRedundantDataInCollections: No duplicate record found between location streamed and keyword filtered stream data');
                                            //continue to next iteration as no overlap found for current eachGlasgowTweet.id_str
                                            callback();
                                        }
                                    }
                                });
                            },
                            //final param of forEachSeries to print the final number of duplicate data between location and keyword filtered stream data    
                            function (errAsyncDuplicate) {
                                //handle error
                                if (errAsyncDuplicate) {
                                    //log the error found
                                    logger.error('totalRedundantDataInCollections: ERROR in async for finding overlap between location and keyword filtered stream data: ' + errAsyncDuplicate);
                                    //go to next function
                                    callback(null, totalRedundantTweetsInCollections);
                                } else {
                                    //log the final output
                                    logger.info('totalRedundantDataInCollections: Finished finding duplicate tweets in all collections');
                                    //go to next function
                                    callback(null, totalRedundantTweetsInCollections);
                                }
                            });
                    }
                ],
                //FINAL FUNCTION after all functions above has executed
                function (err, result) {
                    //log the final result of redundant data found
                    logger.info('Total redundant data present in all the collections is: ' + result);
                    output.info('Total redundant data present in all the collections is: ' + result);
                });
        }
    });
}

exports.countGeoTaggedTweetsAndOverlappingData = function () {
    /**
     * Query to find the number of documents
     * Here, count() is deprecated (found by seeing a warning on console)
     * Hence, using counDocuments() instead
     */
    TweetsDB.tweetsSTREAMLocationFilter.countDocuments({}, function (error, count) {
        if (error) {
            //log the error
            logger.error('ERROR in counting geo tagged tweets collected via location filter stream: ' + JSON.stringify(error));
        } else {
            //assign count to geoTaggedGlasgowTweets
            geoTaggedGlasgowTweets = count;
            //log the tweet count
            output.info("Number of geo tagged tweets collected using location filter stream: " + geoTaggedGlasgowTweets);
            logger.info("Number of geo tagged tweets collected using location filter stream: " + geoTaggedGlasgowTweets);
        }
    });

    /**
     * Query to find if any overlap is present between the
     * location filtered data from Glasgow
     * and the no filter streamed data
     */
    TweetsDB.tweetsSTREAMLocationFilter.find({}, function (errFind, tweets) {
        if (errFind) {
            //log the error
            logger.error('ERROR in finding all location streamed data: ' + errFind);
        } else {
            //log the tweets array length found
            logger.info('Number of tweets from Glasgow using streaming are: ' + tweets.length);

            //loop through each location based tweet and find if any tweet is present in the no filtered streamed data
            async.forEachSeries(tweets, function (eachGlasgowTweet, callback) {
                    TweetsDB.tweetsSTREAMNoFilter.find({
                        'id_str': JSON.parse(JSON.stringify(eachGlasgowTweet)).id_str
                    }, function (err, overlapFound) {
                        if (err) {
                            //log the error
                            logger.error('ERROR in finding in no filter stream collection: ' + err);
                            //continue to the next iteration
                            callback();
                        } else {
                            if (overlapFound.length != 0) {
                                //log the overlap success found message only if any overlap tweet found
                                logger.info('Overlap record found between location streamed and no filter streamed data length: ' + overlapFound.length);
                                //increment the length of the total overlap by number of overlaps found
                                totalOverlapTweetsLocationNoFilterStream = totalOverlapTweetsLocationNoFilterStream + overlapFound.length;
                                //continue to next iteration
                                callback();
                            } else {
                                //log the overlap not found message iff no overlap tweet found
                                // logger.info('No overlap record found between location streamed and no filter streamed data.');
                                //continue to next iteration as no overlap found for current eachGlasgowTweet.id_str
                                callback();
                            }
                        }
                    });
                },
                //final param of forEachSeries to print the final number of overlapped data between location and no stream filter data    
                function (errAsyncOverlap) {
                    //handle error
                    if (errAsyncOverlap) {
                        //log the error found
                        logger.error('ERROR in async for finding overlap between location and no filter stream data: ' + errAsyncOverlap);
                    } else {
                        //log the final output
                        logger.info('Total overlapping data found between Geo-tagged and No Filter Streamed Data: ' + totalOverlapTweetsLocationNoFilterStream);
                        output.info('Total overlapping data found between Geo-tagged and No Filter Streamed Data: ' + totalOverlapTweetsLocationNoFilterStream);
                    }
                });
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
                        logger.error('ERROR in counting tweets collected via REST API: ' + JSON.stringify(error));
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
                                logger.error('ERROR in finding tweets with place as not null for REST API calls: ' + errFind);
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
                        logger.error('ERROR in counting tweets collected via no filter stream: ' + JSON.stringify(error));
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
                                logger.error('ERROR in finding tweets with place as not null via no filter stream: ' + errFind);
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
                        logger.error('ERROR in counting tweets collected via keyword filter stream: ' + JSON.stringify(error));
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
                                logger.error('ERROR in finding tweets with place as not null via keyword filter stream: ' + errFind);
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
                        logger.error('ERROR in counting tweets collected via location filter stream: ' + JSON.stringify(error));
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
                                logger.error('ERROR in finding tweets with place as not null via location filter stream: ' + errFind);
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
            //log the total tweet counted overall
            output.info('Total number of tweets collected using REST and STREAM are: ' + result.totalTweets);
            logger.info('Total number of tweets collected using REST and STREAM are: ' + result.totalTweets);
            //log the total geo-tagged tweets overall
            output.info('Total number of geo-tagged tweets collected using REST and STREAM are: ' + result.totalGeoTweets);
            logger.info('Total number of geo-tagged tweets collected using REST and STREAM are: ' + result.totalGeoTweets);
        });
}
