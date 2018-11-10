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
var tweetSchemaSTREAMKeywordFilter = new Schema({}, { strict: false });
var tweetSchemaREST = new Schema({}, { strict: false });
var tweetSchemaSTREAMNoFilter = new Schema({}, { strict: false });
var tweetSchemaSTREAMLocationFilter = new Schema({}, { strict: false });

/**
 * indexing the schema and making the user_id field as unique 
 * this will not on the existing database schema, but only on the 
 * new schema, so to make this work, drop existing schema and 
 * create a new one
 */
// tweetSchema.index({id_str: 1, id_str: 1}, {unique: true}); --> COMMENTING OUT RIGHT NOW TO ENABLE DUPLICATE DATA ENTRY ALLOWED IN THE DATABASE

/**
 * we need to create a model using it and export it
 * models exported are for rest api, no keyword filter stream,
 * keywords filtering stream and
 * glasgow location filter stream
 */
module.exports.tweetsSTREAMKeywordFilter = mongoose.model('tweetsSTREAMKeywordFilter',tweetSchemaSTREAMKeywordFilter);
module.exports.tweetsREST = mongoose.model('tweetsREST',tweetSchemaREST);
module.exports.tweetsSTREAMNoFilter = mongoose.model('tweetsSTREAMNoFilter',tweetSchemaSTREAMNoFilter);
module.exports.tweetsSTREAMLocationFilter = mongoose.model('tweetsSTREAMLocationFilter',tweetSchemaSTREAMLocationFilter);
