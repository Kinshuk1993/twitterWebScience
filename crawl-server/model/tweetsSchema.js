//require mongoose module
var mongoose = require('mongoose');

//create schema variable
var Schema = mongoose.Schema;

//NOT TO BE REMOVED - DEFINES A SAMPLE SCHEMA FOR TWEET DB
// create a sample schema with fields and mention the validators
// var tweetSchema = new Schema({
//     user_id: {
//         type: Number,
//         required: [true, 'User Id is missing']
//     },
//     tweet: String,
//     geo_tagged: Boolean
// });

/**
 * setting strict mode for schema to false so that saving to the database
 * can be done without any existing schema as tweets can be different structres of it
 * with some missing some fields and some having additional fields.
 */
var tweetSchema = new Schema({}, { strict: false });

/**
 * indexing the schema and making the user_id field as unique 
 * this will not on the existing database schema, but only on the 
 * new schema, so to make this work, drop existing schema and 
 * create a new one
 */
// tweetSchema.index({id_str: 1, id_str: 1}, {unique: true}); --> COMMENTING OUT RIGHT NOW TO ENABLE DUPLICATE DATA ENTRY ALLOWED IN THE DATABASE

// we need to create a model using it
var Tweets = mongoose.model('tweets', tweetSchema);

// make this available to our users in our Node applications
module.exports = Tweets;