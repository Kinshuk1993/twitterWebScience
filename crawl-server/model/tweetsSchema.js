//require mongoose module
var mongoose = require('mongoose');

//create schema variable
var Schema = mongoose.Schema;

// create a sample schema with fields and mention the validators
var tweetSchema = new Schema({
    user_id: {
        type: Number,
        required: [true, 'User Id is missing']
    },
    tweet: String,
    geo_tagged: Boolean
});

/**
 * indexing the schema and making the user_id field as unique 
 * this will not on the existing database schema, but only on the 
 * new schema, so to make this work, drop existing schema and 
 * create a new one
 */
tweetSchema.index({user_id: 1}, {unique: true});

// we need to create a model using it
var Tweets = mongoose.model('tweets', tweetSchema);

// make this available to our users in our Node applications
module.exports = Tweets;