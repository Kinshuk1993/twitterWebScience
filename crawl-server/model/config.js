//export for use in app.js
module.exports = {
  //default port and name for the twitter crawler database
  /**
   * This is commented as this DB exists locally and has 1st streaming data in it
   */
  // url: 'mongodb://127.0.0.1/twitterCrawlerDB'


  /**
   * This is commented as this DB exists locally and has 2nd streaming data in it
   */
  // url: 'mongodb://127.0.0.1/secondTwitterDB'


  /**
   * This is commented as this DB exists locally and has 3rd streaming data in it
   */
  // For local MongoDB (if available)
  // url: 'mongodb://127.0.0.1/sampleData'

  // For MongoDB Memory Server (no local MongoDB required)
  url: 'mongodb://127.0.0.1:27017/sampleData',
  useMemoryServer: true // Set to true to use in-memory MongoDB, false for local MongoDB

  // database for final submission
  //url: 'mongodb://127.0.0.1/twitterData'
}