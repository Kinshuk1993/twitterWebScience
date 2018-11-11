//export for use in app.js
module.exports = {
  //default port and name for the twitter crawler database
  /**
   * Commenting the below db as the data is already collected and backedup in this database locally
   */
  /**
   * This is commented as this DB exists locally and has 1st streaming data in it
   */
  // url: 'mongodb://127.0.0.1/twitterCrawlerDB'
  //this is created for further testing as data is collected in twitterCrawlerDB
  /**
   * This is commented as this DB exists locally and has 2nd streaming data in it
   */
  // url: 'mongodb://127.0.0.1/secondTwitterDB'
  //the third db to collect data inside it
  url: 'mongodb://127.0.0.1/thirdTwitterDB'
}