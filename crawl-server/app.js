'use strict';

//require dependencies and inbuild files
var express = require('express');
var path = require('path');
var fs = require('fs');
var logDir = 'Twitter-Crawler-Logs';
var outputLogDir = 'Twitter-Crawler-Final-Output-Log';
var mongoose = require('mongoose');
var getTweets = require('./controller/getTweetsRouter');
var config = require('./model/config');
var logger = require('./logger-config/log-config');
var { startMongoMemoryServer } = require('./model/mongoMemoryServer');
//Commented out Twitter API modules since they try to connect immediately on require()
//Uncomment these if you want to collect Twitter data (and have valid API keys)
// var getTweetsUsingREST = require('./twitterAPIs/restCall');
// var getTweetsUsingNoFilterSTREAM = require('./twitterAPIs/noFilterStreamCall');
// var getTweetsUsingKeywordFilterSTREAM = require('./twitterAPIs/keywordFilterStream');
// var getTweetsUsingLocationFilterSTREAM = require('./twitterAPIs/locationFilterStream');
// var keywordArray = require('./controller/keywords');
//Using for ANALYTICS only
var analytics = require('./controller/analytics');
//Using for ANALYTICS only (clustering commented out in analytics call below)
var clustering = require('./controller/clustering');

//create the program log directory if it does not exist
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

//create the program output log directory if it does not exist
if (!fs.existsSync(outputLogDir)) {
    fs.mkdirSync(outputLogDir);
}

//initialize express
const app = express();

//Function to initialize database connection
async function initializeDatabase() {
    try {
        // Start MongoDB Memory Server if configured
        if (config.useMemoryServer) {
            const memoryServerUri = await startMongoMemoryServer();
            config.url = memoryServerUri;
            logger.info('Using MongoDB Memory Server for testing (no local MongoDB required)');
        }

        //Connect to the mongo database
        await mongoose.connect(config.url);
        logger.info('Successfully connected to database');
    } catch (err) {
        logger.error("Problem in connecting to the mongoDB database: " + JSON.stringify(err));
        logger.info('Application will continue but database operations will fail');
    }
}

// Initialize database connection
initializeDatabase();

//Middleware for bodyparsing using both json and urlencoding (built into Express 4.16+)
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

/**
 * express.static is a built in middleware function to serve static files.
 * We are telling express server public folder is the place to look for the static files
 */
app.use(express.static(path.join(__dirname, 'public')));

//Routing all HTTP requests to /getTweets
app.use('/api/getTweets', getTweets);

/**
 * resond to http get method, first param is path
 * and then http request and response params
 * handle any unknown paths
 */
app.get('/*', (req, res) => {
    logger.info("Path not found error..!!");
    res.send("Page not Found Error");
});

// //call the REST API initially and then put it inside a callback loop
// getTweetsUsingREST.getTweetsREST('amazing');

// //get twitter data using streaming API - streaming without any filter
// getTweetsUsingNoFilterSTREAM.getTweetsSTREAMNoFilter();

// //get twitter data using streaming API - streaming with keyword filter
// getTweetsUsingKeywordFilterSTREAM.getTweetsSTREAMKeywordFilter();

// //get twitter data using streaming API - streaming location based
// getTweetsUsingLocationFilterSTREAM.getTweetsSTREAMLocationFilter();

// // call the REST API every 5 minutes for a total duration of 1 hour
// var intervalForRestCall = setInterval(function () {
//     //work on a sample array as JS will modify original array otherwise
//     var sampleArrayKeyword = []
//     //fill data into sample array
//     for (var i = 0; i < keywordArray.length; i++) {
//         sampleArrayKeyword.push(keywordArray[i])
//     }
//     //variable to store the random keyword to search for using REST call
//     //defaulted to keyword "WEATHER"
//     var randomKeyword = "oneplus";
//     //each time pull from that array and remove the one already used
//     //simple check to check if contents of array
//     if (sampleArrayKeyword.length > 0) {
//         //get a random index of sample array
//         var randomIndex = Math.floor(Math.random() * sampleArrayKeyword.length)
//         //get word on the generated index
//         randomKeyword = sampleArrayKeyword[randomIndex];
//         //log the action
//         logger.info('Keyword being searched for via the twitter REST call is: ' + randomKeyword);
//         //remove the word from the array to avoid duplicate keyword search using REST call
//         //Commenting this line as the frequency for REST call is increased and hence cannot clear the keyword array with every call
//         // sampleArrayKeyword.splice(randomIndex, 1);
//     }
//     //REST call using the random keyword from array
//     getTweetsUsingREST.getTweetsREST(randomKeyword);
//     //repeat the rest call after 5 minutes - See comment @Line 113
//     // }, 300000);
//     //Commenting above as REST call is tested with 10 seconds interval till 1 Hour with 12 rate limit exceeded errors
// }, 10000);

// //set the time after which the REST API calls should stop (1 hour)
// setTimeout(function () {
//     clearInterval(intervalForRestCall);
//     // }, 3600000);
//     //Done for small testing purpose - stopping it after 5 minutes
// }, 300000);

//listen the application at port number 3000
app.listen(3000, () => {
    logger.info('Starting the server at port number 3000');
});


/**
 * If you want to run only the analytics on a data 
 * previously collected, please do remove the below comments
 * to run analytics on collected data
 * 
 * IMPORTANT NOTE: Un-comment out the Lines 77 till 125 to
 * perform the collection of twitter data using REST and STREAMS
 */
//perform analytics on the data collected (wrapped in async IIFE to handle promises)
(async () => {
    try {
        await analytics.countTotalTweetsCollected();
        await analytics.countGeoTaggedTweetsAndOverlappingData();
        await analytics.totalRedundantDataInCollections();
        await analytics.totalRetweetsQuotesCount();
        // Clustering is commented out temporarily due to complexity - can be re-enabled after testing
        // await clustering.minhashLshClustering();
        logger.info('Analytics completed successfully');
    } catch (err) {
        logger.error('Error in analytics: ' + JSON.stringify(err));
    }
})();


/**
 * 
 * #############################################################################################################################################################################
 * IMPORTANT NOTE: There is a possibility that the data received from twitter is NOT JSON FORMATTED
 * Hence have to convert it when processing it via JSON.stringify() and JSON.parse()
 * #############################################################################################################################################################################
 * Current data stats for twitterCrawlerDB:
 * Date: 10th November 2018
 * Start Point at: 2018-11-10 04:08:08 info: No keyword filter stream started
 * End Point at: 2018-11-10 05:08:08 info: Location stream ended.
 * Total runtime: 1 Hour
 * 
 * REST Tweets Collected: 1287 ( REST Calls @ 5 Minutes Interval) (1687 after some more time)
 * No Filter Stream Tweets Collected: 118151 (118255 after some more time)
 * Tweets collected with Keyword Filtering using the word "MORNING": 26437 (29816 after some more time)
 * Glasgow Geo-tagged Tweets Collected: 44 (48 after some more time)
 * #############################################################################################################################################################################
 * Current data stats for secondTwitterDB:
 * Date: 11th November 2018
 * Start Point at: 2018-11-11 22:18:21 info: No keyword filter stream started
 * End Point at: 2018-11-11 23:18:55 info: Total overlapping data found between Geo-tagged and No Filter Streamed Data: 6
 * Total runtime: 1 Hour
 * 
 * REST Tweets Collected: 33792 ( REST Calls @ 10 Seconds Interval with 12 error (extract the 11-11-2018-1.tar file and search "error:") received due to Rate Limit Exceeded)
 * No Filter Stream Tweets Collected: 136885
 * Tweets collected with Keyword Filtering using the words in keyword array: 172802
 * Glasgow Geo-tagged Tweets Collected: 512
 * #############################################################################################################################################################################
 * Command to export mongodb data to bson and json files: https://stackoverflow.com/questions/11255630/how-to-export-all-collection-in-mongodb
 * mongodump --db <db name> --out <path to backup>
 * 
 * Guide to restore and backup mongodb: https://docs.mongodb.com/manual/tutorial/backup-and-restore-tools/
 * mongorestore -d <sample_db_name> <directory_having_backup_files>
 * Example: mongorestore -d sampleData D:\MongoDB-Backup
 * #############################################################################################################################################################################
 * Extracting the sample database tar file:
 * Location: \crawl-server\model\sampleData.tar
 * 
 * Command to extract the tar file: tar -xf sampleData.tar
 * #############################################################################################################################################################################
 */
