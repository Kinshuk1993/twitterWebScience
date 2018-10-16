var mongoose = require('mongoose');

//Set up default mongoose connection
var url = 'mongodb://127.0.0.1/twitterCrawlerDB';

mongoose.connect('url', function (err) {

  if (err) throw err;

  console.log('Successfully connected');

});

var Schema = mongoose.Schema;

// create a schema
var tweetSchema = new Schema({
  name: String,
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  admin: Boolean,
  location: String,
  meta: {
    age: Number,
    website: String
  },
  created_at: Date,
  updated_at: Date
});

// on every save, add the date
userSchema.pre('save', function (next) {

  // change the updated_at field to current date
  this.updated_at = new Date();

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  //go to the next command to execute
  next();
});

// the schema is useless so far
// we need to create a model using it
var Tweets = mongoose.model('tweets', tweetSchema);

// make this available to our users in our Node applications
module.exports = Tweets;