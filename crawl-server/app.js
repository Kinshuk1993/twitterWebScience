//require dependencies and inbuild files
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var getTweets = require('./controller/getTweetsRouter');
var TweetsDB = require('./model/tweetsSchema');
var config = require('./model/config');

//initialize express
const app = express();

//Coonect to the mongo database
mongoose.connect(config.url, function (err) {
    if (err) throw err;
    console.log('Successfully connected to database');
});

//Middleware for bodyparsing using both json and urlencoding
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

/**
 * express.static is a built in middleware function to serve static files.
 * We are telling express server public folder is the place to look for the static files
 */
app.use(express.static(path.join(__dirname, 'public')));

//Routing all HTTP requests to /getTweets
app.use('/api/getTweets', getTweets);

//sample tweet object to save initially based on some condition
// var testTweet = new TweetsDB({
//     user_id: 100,
//     tweet: "Test tweet",
//     geo_tagged: false
// });

//TO CHECK STRICT MODE FALSE FOR MONGODB
// var testTweet2 = new TweetsDB({
//     user_id: 101,
//     tweet: "Test tweet",
//     geo_tagged: false,
//     test: 'Kinshuk testing strict mode'
// });

// testTweet2.save(function(err, savedData) {
//     if (err) throw err;
//     console.log('Errorin strict mode false: ', savedData);
// })

//condition to check if tweet is to be saved in the database or not
// TweetsDB.find({}, function (err, tweets) {
//     //hande error case
//     if (err) {
//         //log error to console window
//         console.log('Error in finding from tweets database: ', JSON.stringify(err));
//     } else {
//         //print existing tweets lenght to console window
//         console.log('The number of tweets found are: ', tweets.length);
//         //if existing tweets present
//         if (tweets.length != 0) {
//             //if tweets exists, do nothing and console message
//             console.log('Tweets exists, hence not adding the default tweet to the database');
//         } else {
//             //if no tweets in the database, enter a sample tweet
//             //TO DO: remove this functionality afterwards
//             testTweet.save(function (err, savedTweet) {
//                 //handle error in saving tweet to database
//                 if (err) {
//                     console.log('Error in saving first tweet to the database: ', JSON.stringify(err));
//                 } else { //log the success of saving tweet to database
//                     console.log('First Tweet saved to db: ', savedTweet);
//                 }
//             });
//         }
//     }
// });

//resond to http get method, first param is path
//and then http request and response params
//handle any unknown paths
app.get('/*', (req, res) => {
    res.send("Page not Found Error");
});

//listen the application at port number 3000
app.listen(3000, () => {
    console.log('Starting the server at port number 3000');
});