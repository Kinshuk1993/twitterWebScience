//include express package
var express = require('express');
//for routing
var router = express.Router();
//get the controller
var controller = require('./getTweetsController');

//GET HTTP router methods for /getTweets
//GET
router.get('/', controller.findAllRESTTweets);
//POST
router.post('/', controller.saveNewTweetViaREST);
//GET the tweets using streaming
router.get('/tweetsREST', controller.getTweetsREST);

//export the router
module.exports = router;