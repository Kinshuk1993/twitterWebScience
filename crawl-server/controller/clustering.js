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

exports.kMeansClustering = function () {
    async.waterfall([
        //1. Function to get all geo-location tweets from database
        function (callback) {
            TweetsDB.tweetsSTREAMNoFilter.find({}, function (err, geoTweets) {
                if (err) {
                    //log the error
                    logger.error('kMeansClustering: Error in finding geo tweets in location filter stream collection: ' + err);
                    //continue to the next function
                    callback(null, geoTweets);
                } else {
                    console.log('geo tweets length: ' + geoTweets.length);
                    callback(null, geoTweets);
                }
            });
        },
        //2. Function to perform K means on geo-tagged data
        function (geoTweets, callback) {
            var vectors = new Array();
            for (var i = 0; i < geoTweets.length; i++) {
                // console.log(JSON.parse(JSON.stringify(geoTweets[i])).id_str)
                vectors[i] = [JSON.parse(JSON.stringify(geoTweets[i])).text.length, JSON.parse(JSON.stringify(geoTweets[i])).user.followers_count];
            }
            kmeans.clusterize(vectors, {
                k: 20
            }, (err, res) => {
                if (err){
                    console.log('Error: ' + err);
                    callback(null, geoTweets.length);
                } else {
                    console.log('%o', res);
                    callback(null, geoTweets.length);
                }
            });
            // var kMeans = new clustering.KMEANS();
            // // parameters: 3 - number of clusters
            // var clusters = kMeans.run(vectors, 20);
            // console.log(clusters);
            // callback(null, geoTweets.length);
        }

    ], function (err, result) {
        console.log('Final: ' + result);
    })
}


//remove k-means or density-clustering