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

// Helper function to count retweets in a collection
async function countRetweetsInCollection(collection, collectionName) {
    try {
        const tweets = await collection.find({}).exec();
        let retweetCount = 0;

        for (const tweet of tweets) {
            const tweetObj = JSON.parse(JSON.stringify(tweet));
            if (tweetObj.text && tweetObj.text.substring(0, 2) === "RT") {
                retweetCount++;
            }
        }

        logger.info(`totalRetweetsQuotesCount: Found ${retweetCount} retweets in ${collectionName}`);
        return retweetCount;
    } catch (err) {
        logger.error(`totalRetweetsQuotesCount: ERROR in finding retweets in ${collectionName}: ` + JSON.stringify(err));
        return 0;
    }
}

// Helper function to count quoted tweets in a collection
async function countQuotedTweetsInCollection(collection, collectionName) {
    try {
        const quotedTweets = await collection.find({ 'is_quote_status': true }).exec();

        if (quotedTweets.length !== 0) {
            logger.info(`totalRetweetsQuotesCount: Quote tweets found in ${collectionName}: ` + quotedTweets.length);
        } else {
            logger.info(`totalRetweetsQuotesCount: No quote tweets found in ${collectionName}.`);
        }

        return quotedTweets.length;
    } catch (err) {
        logger.error(`totalRetweetsQuotesCount: ERROR in finding quote tweets in ${collectionName}: ` + JSON.stringify(err));
        return 0;
    }
}

exports.totalRetweetsQuotesCount = async function () {
    try {
        // Count retweets in all collections
        totalRetweetedTweets += await countRetweetsInCollection(TweetsDB.tweetsREST, 'REST collection');
        totalQuoteTweets += await countQuotedTweetsInCollection(TweetsDB.tweetsREST, 'REST collection');

        totalRetweetedTweets += await countRetweetsInCollection(TweetsDB.tweetsSTREAMKeywordFilter, 'keyword filter stream collection');
        totalQuoteTweets += await countQuotedTweetsInCollection(TweetsDB.tweetsSTREAMKeywordFilter, 'keyword filter stream collection');

        totalRetweetedTweets += await countRetweetsInCollection(TweetsDB.tweetsSTREAMNoFilter, 'no filter stream collection');
        totalQuoteTweets += await countQuotedTweetsInCollection(TweetsDB.tweetsSTREAMNoFilter, 'no filter stream collection');

        totalRetweetedTweets += await countRetweetsInCollection(TweetsDB.tweetsSTREAMLocationFilter, 'location filter stream collection');
        totalQuoteTweets += await countQuotedTweetsInCollection(TweetsDB.tweetsSTREAMLocationFilter, 'location filter stream collection');

        // Log final results
        logger.info('Total retweeted tweets present in all the collections is: ' + totalRetweetedTweets);
        logger.info('Total quoted tweets present in all the collections is: ' + totalQuoteTweets);
        output.info('Total retweeted tweets present in all the collections is: ' + totalRetweetedTweets);
        output.info('Total quoted tweets present in all the collections is: ' + totalQuoteTweets);
    } catch (err) {
        logger.error('Error in totalRetweetsQuotesCount: ' + JSON.stringify(err));
    }
}

exports.totalRedundantDataInCollections = async function () {
    try {
        const tweets = await TweetsDB.tweetsSTREAMLocationFilter.find({}).exec();
        logger.info('totalRedundantDataInCollections: Number of tweets from Glasgow using streaming are: ' + tweets.length);

        // Check duplicates in no filter stream
        for (const eachGlasgowTweet of tweets) {
            try {
                const duplicateTweet = await TweetsDB.tweetsSTREAMNoFilter.find({
                    'id_str': JSON.parse(JSON.stringify(eachGlasgowTweet)).id_str
                }).exec();

                if (duplicateTweet.length !== 0) {
                    logger.info('totalRedundantDataInCollections: Duplicate tweet found between location and no filter stream: ' + duplicateTweet.length);
                    totalRedundantTweetsInCollections += duplicateTweet.length;
                }
            } catch (err) {
                logger.error('totalRedundantDataInCollections: ERROR in finding in no filter stream collection: ' + err);
            }
        }

        // Check duplicates in REST API data
        for (const eachGlasgowTweet of tweets) {
            try {
                const duplicateTweet = await TweetsDB.tweetsREST.find({
                    'id_str': JSON.parse(JSON.stringify(eachGlasgowTweet)).id_str
                }).exec();

                if (duplicateTweet.length !== 0) {
                    logger.info('totalRedundantDataInCollections: Duplicate tweet found between location and REST API data: ' + duplicateTweet.length);
                    totalRedundantTweetsInCollections += duplicateTweet.length;
                }
            } catch (err) {
                logger.error('totalRedundantDataInCollections: ERROR in finding duplicate in REST API collection: ' + err);
            }
        }

        // Check duplicates in keyword filtered stream
        for (const eachGlasgowTweet of tweets) {
            try {
                const duplicateTweet = await TweetsDB.tweetsSTREAMKeywordFilter.find({
                    'id_str': JSON.parse(JSON.stringify(eachGlasgowTweet)).id_str
                }).exec();

                if (duplicateTweet.length !== 0) {
                    logger.info('totalRedundantDataInCollections: Duplicate tweet found between location and keyword filtered stream data: ' + duplicateTweet.length);
                    totalRedundantTweetsInCollections += duplicateTweet.length;
                }
            } catch (err) {
                logger.error('totalRedundantDataInCollections: ERROR in finding duplicate in keyword filtered stream data collection: ' + err);
            }
        }

        // Log final result
        logger.info('Total redundant data present in all the collections is: ' + totalRedundantTweetsInCollections);
        output.info('Total redundant data present in all the collections is: ' + totalRedundantTweetsInCollections);
    } catch (errFind) {
        logger.error('totalRedundantDataInCollections: ERROR in finding all location streamed data: ' + errFind);
    }
}

exports.countGeoTaggedTweetsAndOverlappingData = async function () {
    try {
        // Count geo-tagged tweets
        const count = await TweetsDB.tweetsSTREAMLocationFilter.countDocuments({}).exec();
        geoTaggedGlasgowTweets = count;
        output.info("Number of geo tagged tweets collected using location filter stream: " + geoTaggedGlasgowTweets);
        logger.info("Number of geo tagged tweets collected using location filter stream: " + geoTaggedGlasgowTweets);

        // Find overlapping data
        const tweets = await TweetsDB.tweetsSTREAMLocationFilter.find({}).exec();
        logger.info('Number of tweets from Glasgow using streaming are: ' + tweets.length);

        for (const eachGlasgowTweet of tweets) {
            try {
                const overlapFound = await TweetsDB.tweetsSTREAMNoFilter.find({
                    'id_str': JSON.parse(JSON.stringify(eachGlasgowTweet)).id_str
                }).exec();

                if (overlapFound.length !== 0) {
                    logger.info('Overlap record found between location streamed and no filter streamed data length: ' + overlapFound.length);
                    totalOverlapTweetsLocationNoFilterStream += overlapFound.length;
                }
            } catch (err) {
                logger.error('ERROR in finding in no filter stream collection: ' + err);
            }
        }

        logger.info('Total overlapping data found between Geo-tagged and No Filter Streamed Data: ' + totalOverlapTweetsLocationNoFilterStream);
        output.info('Total overlapping data found between Geo-tagged and No Filter Streamed Data: ' + totalOverlapTweetsLocationNoFilterStream);
    } catch (error) {
        logger.error('ERROR in counting geo tagged tweets collected via location filter stream: ' + JSON.stringify(error));
    }
}

exports.countTotalTweetsCollected = async function () {
    try {
        // Count REST API tweets
        const restCount = await TweetsDB.tweetsREST.countDocuments({}).exec();
        logger.info("Number of tweets collected using REST API: " + restCount);
        totalTweetsCount += restCount;

        const restGeoTagged = await TweetsDB.tweetsREST.find({ "place": { $ne: null } }).exec();
        totalGeoTaggedTweets += restGeoTagged.length;

        // Count no filter stream tweets
        const noFilterCount = await TweetsDB.tweetsSTREAMNoFilter.countDocuments({}).exec();
        logger.info("Number of tweets collected using no filter stream: " + noFilterCount);
        totalTweetsCount += noFilterCount;

        const noFilterGeoTagged = await TweetsDB.tweetsSTREAMNoFilter.find({ "place": { $ne: null } }).exec();
        totalGeoTaggedTweets += noFilterGeoTagged.length;

        // Count keyword filter stream tweets
        const keywordCount = await TweetsDB.tweetsSTREAMKeywordFilter.countDocuments({}).exec();
        logger.info("Number of tweets collected using keyword filter stream: " + keywordCount);
        totalTweetsCount += keywordCount;

        const keywordGeoTagged = await TweetsDB.tweetsSTREAMKeywordFilter.find({ "place": { $ne: null } }).exec();
        totalGeoTaggedTweets += keywordGeoTagged.length;

        // Count location filter stream tweets
        const locationCount = await TweetsDB.tweetsSTREAMLocationFilter.countDocuments({}).exec();
        logger.info("Number of tweets collected using location filter stream: " + locationCount);
        totalTweetsCount += locationCount;

        const locationGeoTagged = await TweetsDB.tweetsSTREAMLocationFilter.find({ "place": { $ne: null } }).exec();
        totalGeoTaggedTweets += locationGeoTagged.length;

        // Log final results
        output.info('Total number of tweets collected using REST and STREAM are: ' + totalTweetsCount);
        logger.info('Total number of tweets collected using REST and STREAM are: ' + totalTweetsCount);
        output.info('Total number of geo-tagged tweets collected using REST and STREAM are: ' + totalGeoTaggedTweets);
        logger.info('Total number of geo-tagged tweets collected using REST and STREAM are: ' + totalGeoTaggedTweets);
    } catch (err) {
        logger.error('ERROR in countTotalTweetsCollected: ' + JSON.stringify(err));
    }
}
