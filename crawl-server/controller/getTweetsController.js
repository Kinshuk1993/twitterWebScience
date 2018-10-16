//get the tweets model
var TweetsDB = require('../model/tweetsSchema');

//export the methods
module.exports = {
    //function to find all tweets from database
    findAllTweets: function(req, res) {
        //fun find command
        TweetsDB.find((err, tweetList) => {
            //handle error scenario and return error code
            if (err) {
                console.log('Error in finding in the database: ', err);
                return handleError(res, err);
            } else { //handle sucess case of tweets found with response code and body
                console.log('The tweets are: ', tweetList);
                //express deprecated res.send(status, body): Use res.status(status).send(body)
                //got to know from the exception of deprecated thrown while testing
                return res.status(200).send(tweetList);
            }
        })
    },

    //Function to save a new tweet to the database
    saveNewTweet: function(req, res) {
        //build the tweet object to save
        var newTweet = new TweetsDB({
            user_id: req.body.user_id,
            tweet: req.body.tweet,
            geo_tagged: req.body.geo_tagged
        });
        //run the save command
        newTweet.save(function(err, savedTweet) {
            //handle error scenario and return with not found error code
            if (err) {
                //log error on console
                console.log('Error in saving new tweets to the database: ', JSON.stringify(err));
                //return error
                return handleError(res, err);
            } else {
                //log success on console
                console.log('New tweets saved to db: ', JSON.stringify(savedTweet));
                //express deprecated res.send(status, body): Use res.status(status).send(body)
                //got to know from the exception of deprecated thrown while testing
                //return
                return res.status(200).send(savedTweet);
            }
        });
    }
}

//function to handle the error response
function handleError(res, err) {
    //return
    return res.send(500, err);
  }