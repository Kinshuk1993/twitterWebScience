//include express package
var express = require('express');
//for routing
var router = express.Router();
//get the controller
var controller = require('./getTweetsController');

//GET HTTP router methods for /getTweets
//GET
router.get('/', controller.findAllTweets);
//POST
router.post('/', controller.saveNewTweet);
//GET the tweets using streaming
router.get('/tweetsREST', controller.getTweetsREST);

//export the router
module.exports = router;