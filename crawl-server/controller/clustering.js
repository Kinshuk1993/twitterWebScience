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
//include plotly graph
var plotly = require('plotly')("kinshukb", "o4ZxVuiWSEGM2jAQud16");
//variables to store new cluster information for geo data and user geo information
//variables to store if each entry of the cluster contains geo data and user geo information or not
var newArrayPlace = [],
    newArrayGeoEnabled = [],
    eachNewInternalArrayPlace = [],
    eachNewInternalArrayGeoEnabled = [];

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
                                'place': {},
                                'geoEnabled': ''
                            };
                            dataToWrite.text = JSON.parse(JSON.stringify(eachNoFilterTweet)).text.replace(regex, '').toString();
                            dataToWrite.id = JSON.parse(JSON.stringify(eachNoFilterTweet)).id_str;
                            dataToWrite.place = JSON.parse(JSON.stringify(eachNoFilterTweet)).place ? JSON.parse(JSON.stringify(eachNoFilterTweet)).place : 'null';
                            dataToWrite.geoEnabled = JSON.parse(JSON.stringify(eachNoFilterTweet)).user.geo_enabled;
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
                                'place': {},
                                'geoEnabled': ''
                            };
                            dataToWrite.text = JSON.parse(JSON.stringify(eachRestTweet)).text.replace(regex, '').toString();
                            dataToWrite.id = JSON.parse(JSON.stringify(eachRestTweet)).id_str;
                            dataToWrite.place = JSON.parse(JSON.stringify(eachRestTweet)).place ? JSON.parse(JSON.stringify(eachRestTweet)).place : 'null';
                            dataToWrite.geoEnabled = JSON.parse(JSON.stringify(eachRestTweet)).user.geo_enabled;
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
            // callback(null, totalTweets);
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
                                'place': {},
                                'geoEnabled': ''
                            };
                            dataToWrite.text = JSON.parse(JSON.stringify(eachKeywordTweet)).text.replace(regex, '').toString();
                            dataToWrite.id = JSON.parse(JSON.stringify(eachKeywordTweet)).id_str;
                            dataToWrite.place = JSON.parse(JSON.stringify(eachKeywordTweet)).place ? JSON.parse(JSON.stringify(eachKeywordTweet)).place : 'null';
                            dataToWrite.geoEnabled = JSON.parse(JSON.stringify(eachKeywordTweet)).user.geo_enabled;
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
            // callback(null, totalTweets);
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
                                'place': {},
                                'geoEnabled': ''
                            };
                            dataToWrite.text = JSON.parse(JSON.stringify(eachGeoTweet)).text.replace(regex, '').toString();
                            dataToWrite.id = JSON.parse(JSON.stringify(eachGeoTweet)).id_str;
                            dataToWrite.place = JSON.parse(JSON.stringify(eachGeoTweet)).place ? JSON.parse(JSON.stringify(eachGeoTweet)).place : 'null';
                            dataToWrite.geoEnabled = JSON.parse(JSON.stringify(eachGeoTweet)).user.geo_enabled;
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
            // callback(null, totalTweets);
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
                    index.insert(each.id + "-" + each.place + "-" + each.geoEnabled, m);
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
            //variable to store unique clusters
            var allMatchesUnique = [];
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
                        callback(null, totalTweets, allMatchesUnique);
                    } else {
                        //convert the arrays to JSON strings and use a Set to get unique values
                        var set = new Set(allMatches.map(JSON.stringify));
                        //convert back to array of arrays again
                        allMatchesUnique = Array.from(set).map(JSON.parse);
                        logger.info('kMeansClustering: Going to function 7 to form the cluster graph');
                        //go to next function
                        callback(null, totalTweets, allMatchesUnique);
                    }
                });
        },
        //7. Function to gather data to plot the graph
        function (totalTweets, allMatchesUnique, callback) {
            var one = [],
                two = [],
                threeTo4 = [],
                fiveTo9 = [],
                tenTo19 = [],
                twentyTo49 = [],
                moreThan50 = [];
            async.forEachSeries(allMatchesUnique, function (eachMatch, callback) {
                    if (eachMatch.length >= 1 && eachMatch.length < 2) {
                        one.push(eachMatch);
                        callback();
                    } else if (eachMatch.length >= 2 && eachMatch.length < 3) {
                        two.push(eachMatch);
                        callback();
                    } else if (eachMatch.length >= 3 && eachMatch.length < 5) {
                        threeTo4.push(eachMatch);
                        callback();
                    } else if (eachMatch.length >= 5 && eachMatch.length < 10) {
                        fiveTo9.push(eachMatch);
                        callback();
                    } else if (eachMatch.length >= 10 && eachMatch.length < 20) {
                        tenTo19.push(eachMatch);
                        callback();
                    } else if (eachMatch.length >= 20 && eachMatch.length < 50) {
                        twentyTo49.push(eachMatch);
                        callback();
                    } else {
                        moreThan50.push(eachMatch);
                        callback();
                    }
                },
                function (err) {
                    var xVal = ['1', '2', '3-4', '5-9', '10-19', '20-49', 'More than equal to 50'];
                    var yVal = [one.length, two.length, threeTo4.length, fiveTo9.length, tenTo19.length, twentyTo49.length, moreThan50.length];

                    var data = [{
                        x: xVal,
                        y: yVal,
                        type: 'bar',
                        text: yVal.map(String),
                        textposition: 'auto',
                        hoverinfo: 'none',
                        marker: {
                            color: 'rgb(158,202,225)',
                            opacity: 0.6,
                            line: {
                                color: 'rgb(8,48,107)',
                                width: 1.5
                            }
                        }
                    }];
                    var layout = {
                        title: "Number of clusters in Ranges",
                        fileopt: "overwrite",
                        filename: "simple-node-example",
                        font: {
                            family: "Raleway, sans-serif"
                        },
                        bargap: 0.05
                    };
                    plotly.plot(data, layout, function (err, msg) {
                        if (err) {
                            logger.error('Error in plotting graph for number of clusters');
                            //go to the next function
                            callback(null, totalTweets, allMatchesUnique);
                        } else {
                            //log the output to logger and final output file
                            logger.info('Message to check the graph for the size of clusters formed by Minhash LSH: ' + JSON.stringify(msg));
                            output.info('Link to check the graph for the size of clusters formed by Minhash LSH: ' + JSON.stringify(msg.url));
                            //go to the next function
                            callback(null, totalTweets, allMatchesUnique);
                        }
                    });
                });
        },
        //8. Funciton to find geo-tagged and user profile geo information
        function (totalTweets, allMatchesUnique, callback) {
            //loop through all unique clusters
            async.forEachSeries(allMatchesUnique, function (eachMatch, callback) {
                    //loop through each match cluster entry
                    async.forEachSeries(eachMatch, function (singleEntry, callback) {
                            //split the string
                            var splitSingle = singleEntry.split('-');
                            //check if place is null, if not then push '1' to the array
                            if (!(splitSingle[1] == 'null')) {
                                eachNewInternalArrayPlace.push(1);
                            }
                            //check if geo information is true or not, if so, then push '1' to the array
                            if (splitSingle[2] == 'true') {
                                eachNewInternalArrayGeoEnabled.push(1);
                            }
                            //go to the next entry of matched cluster entry (inner loop)
                            callback();
                        },
                        //final function for internal loop
                        function (errSingle) {
                            if (errSingle) {
                                console.log('err 1');
                                callback();
                            } else {
                                if (eachNewInternalArrayPlace.length != 0) {
                                    //create place data
                                    newArrayPlace.push(JSON.stringify(eachNewInternalArrayPlace));
                                }
                                if (eachNewInternalArrayGeoEnabled.length != 0) {
                                    //create user geo information data
                                    newArrayGeoEnabled.push(JSON.stringify(eachNewInternalArrayPlace));
                                }
                                //empty contents of array for next iteration
                                eachNewInternalArrayPlace.splice(0, eachNewInternalArrayPlace.length);
                                eachNewInternalArrayGeoEnabled.splice(0, eachNewInternalArrayGeoEnabled.length);
                                //go to the next iteration of outer loop
                                callback();
                            }
                        });
                },
                //final function for outer loop
                function (errFinal) {
                    if (errFinal) {
                        //log the error
                        logger.error('Error in outer async of function 8: ' + errFinal);
                        //going to next function to find geo-tagged and user profile geo information
                        callback(null, totalTweets, allMatchesUnique, newArrayPlace, newArrayGeoEnabled);
                    } else {
                        logger.info('Going to next function to find geo-tagged and user profile geo information');
                        //going to next function to find geo-tagged and user profile geo information
                        callback(null, totalTweets, allMatchesUnique, newArrayPlace, newArrayGeoEnabled);
                    }
                });
        },
        //9. Function to build graphs for geo-tagged data
        function (totalTweets, allMatchesUnique, newArrayPlace, newArrayGeoEnabled, callback) {
            var one = [],
                two = [],
                threeTo4 = [],
                fiveTo9 = [],
                tenTo19 = [],
                twentyTo49 = [],
                moreThan50 = [];
            async.forEachSeries(newArrayPlace, function (eachPlace, callback) {
                    if (eachPlace.length >= 1 && eachPlace.length < 2) {
                        one.push(eachPlace);
                        callback();
                    } else if (eachPlace.length >= 2 && eachPlace.length < 3) {
                        two.push(eachPlace);
                        callback();
                    } else if (eachPlace.length >= 3 && eachPlace.length < 5) {
                        threeTo4.push(eachPlace);
                        callback();
                    } else if (eachPlace.length >= 5 && eachPlace.length < 10) {
                        fiveTo9.push(eachPlace);
                        callback();
                    } else if (eachPlace.length >= 10 && eachPlace.length < 20) {
                        tenTo19.push(eachPlace);
                        callback();
                    } else if (eachPlace.length >= 20 && eachPlace.length < 50) {
                        twentyTo49.push(eachPlace);
                        callback();
                    } else {
                        moreThan50.push(eachPlace);
                        callback();
                    }
                },
                function (err) {
                    var xVal = ['1', '2', '3-4', '5-9', '10-19', '20-49', 'More than equal to 50'];
                    var yVal = [one.length, two.length, threeTo4.length, fiveTo9.length, tenTo19.length, twentyTo49.length, moreThan50.length];

                    var data = [{
                        x: xVal,
                        y: yVal,
                        type: 'bar',
                        text: yVal.map(String),
                        textposition: 'auto',
                        hoverinfo: 'none',
                        marker: {
                            color: 'rgb(158,202,225)',
                            opacity: 0.6,
                            line: {
                                color: 'rgb(8,48,107)',
                                width: 1.5
                            }
                        }
                    }];
                    var layout = {
                        title: "Number of geo-tagged clusters across different ranges in Minhash LSH Clustering",
                        fileopt: "overwrite",
                        filename: "basic-bar",
                        font: {
                            family: "Raleway, sans-serif"
                        },
                        bargap: 0.05
                    };
                    plotly.plot(data, layout, function (err, msg) {
                        if (err) {
                            logger.error('Error in plotting graph for number of geo-tagged clusters in total clusters');
                            //go to the next function
                            callback(null, totalTweets, allMatchesUnique, newArrayGeoEnabled);
                        } else {
                            //log the output to logger and final output file
                            logger.info('Message to check the graph for the number of geo-tagged clusters in cluster formed by Minhash LSH: ' + JSON.stringify(msg));
                            output.info('Link to check the graph for the number of geo-tagged clusters in cluster formed by Minhash LSH: ' + JSON.stringify(msg.url));
                            //go to the next function
                            callback(null, totalTweets, allMatchesUnique, newArrayGeoEnabled);
                        }
                    });
                });
        },
        //10. Function to build graph for user profile geo information
        function (totalTweets, allMatchesUnique, newArrayGeoEnabled, callback) {
            var one = [],
                two = [],
                threeTo4 = [],
                fiveTo9 = [],
                tenTo19 = [],
                twentyTo49 = [],
                moreThan50 = [];
            async.forEachSeries(newArrayGeoEnabled, function (eachUserGeoInfo, callback) {
                    if (eachUserGeoInfo.length >= 1 && eachUserGeoInfo.length < 2) {
                        one.push(eachUserGeoInfo);
                        callback();
                    } else if (eachUserGeoInfo.length >= 2 && eachUserGeoInfo.length < 3) {
                        two.push(eachUserGeoInfo);
                        callback();
                    } else if (eachUserGeoInfo.length >= 3 && eachUserGeoInfo.length < 5) {
                        threeTo4.push(eachUserGeoInfo);
                        callback();
                    } else if (eachUserGeoInfo.length >= 5 && eachUserGeoInfo.length < 10) {
                        fiveTo9.push(eachUserGeoInfo);
                        callback();
                    } else if (eachUserGeoInfo.length >= 10 && eachUserGeoInfo.length < 20) {
                        tenTo19.push(eachUserGeoInfo);
                        callback();
                    } else if (eachUserGeoInfo.length >= 20 && eachUserGeoInfo.length < 50) {
                        twentyTo49.push(eachUserGeoInfo);
                        callback();
                    } else {
                        moreThan50.push(eachUserGeoInfo);
                        callback();
                    }
                },
                function (err) {
                    var xVal = ['1', '2', '3-4', '5-9', '10-19', '20-49', 'More than equal to 50'];
                    var yVal = [one.length, two.length, threeTo4.length, fiveTo9.length, tenTo19.length, twentyTo49.length, moreThan50.length];

                    var data = [{
                        x: xVal,
                        y: yVal,
                        type: 'bar',
                        text: yVal.map(String),
                        textposition: 'auto',
                        hoverinfo: 'none',
                        marker: {
                            color: 'rgb(158,202,225)',
                            opacity: 0.6,
                            line: {
                                color: 'rgb(8,48,107)',
                                width: 1.5
                            }
                        }
                    }];
                    var layout = {
                        title: "Number of user profile based geo information across different ranges in Minhash LSH Clustering",
                        fileopt: "overwrite",
                        filename: "bar-direct-labels",
                        font: {
                            family: "Raleway, sans-serif"
                        },
                        bargap: 0.05
                    };
                    plotly.plot(data, layout, function (err, msg) {
                        if (err) {
                            logger.error('Error in plotting graph for user profile based geo information in total clusters');
                            //go to the next function
                            callback(null, totalTweets);
                        } else {
                            //log the output to logger and final output file
                            logger.info('Message to check the graph for user profile based geo information in cluster formed by Minhash LSH: ' + JSON.stringify(msg));
                            output.info('Link to check the graph for user profile based geo information in cluster formed by Minhash LSH: ' + JSON.stringify(msg.url));
                            //go to the next function
                            callback(null, totalTweets);
                        }
                    });
                });
        }
    ], function (err, result) {
        console.log('End of the waterfall method: ' + result.length);
    })
}