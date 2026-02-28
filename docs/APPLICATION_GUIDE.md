# Twitter Web Science Crawler - Complete Application Guide

**Version:** 2.0 (After Upgrade)
**Last Updated:** November 3, 2025
**Author:** Technical Documentation Team

---

## Table of Contents

1. [Introduction](#introduction)
2. [System Overview](#system-overview)
3. [Getting Started](#getting-started)
4. [User Guide](#user-guide)
5. [Developer Guide](#developer-guide)
6. [Deployment Guide](#deployment-guide)
7. [Maintenance & Operations](#maintenance--operations)

---

## Introduction

### What is Twitter Web Science Crawler?

Twitter Web Science Crawler is a comprehensive data collection and analysis platform designed for academic and research purposes. It enables researchers to:

- **Collect** tweets from Twitter using multiple methods (REST API, Streaming API)
- **Store** tweets in a structured database with categorization
- **Analyze** collected data for patterns, geo-location, redundancy, and engagement
- **Cluster** similar tweets using advanced algorithms
- **Visualize** results through generated graphs and reports

### Key Features

✅ **Multi-Method Data Collection**
- REST API for targeted searches
- Streaming API for real-time data
- Filtered streaming (keywords, location, random sample)

✅ **Advanced Analytics**
- Tweet counting and categorization
- Geo-location analysis (Glasgow-focused)
- Duplicate detection across collections
- Retweet and quote tracking

✅ **Intelligent Clustering**
- MinHash Locality-Sensitive Hashing (LSH) algorithm
- Multi-language stopword removal (20+ languages)
- Similarity-based tweet grouping
- Visual cluster analysis with Plotly graphs

✅ **Research-Ready Features**
- Comprehensive logging for audit trails
- Multiple data collection streams
- Overlap and redundancy analysis
- Export capabilities for further analysis

### Use Cases

**Academic Research:**
- Social media trend analysis
- Public opinion studies
- Event tracking and analysis
- Geographic sentiment analysis

**Data Science:**
- Machine learning dataset creation
- Natural language processing research
- Social network analysis
- Bot detection studies

**Market Research:**
- Brand mention tracking
- Competitor analysis
- Customer sentiment monitoring
- Campaign effectiveness measurement

---

## System Overview

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
│  ┌──────────────────┐              ┌──────────────────┐        │
│  │  Web Browser     │              │  API Clients     │        │
│  │  (localhost:4200)│              │  (Postman, curl) │        │
│  └────────┬─────────┘              └────────┬─────────┘        │
└───────────┼──────────────────────────────────┼──────────────────┘
            │                                   │
            │ HTTP/Angular                      │ HTTP/REST
            ▼                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │            Angular 18 Frontend (crawl-ui)                 │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐         │  │
│  │  │ Components │  │  Services  │  │   Routing  │         │  │
│  │  └────────────┘  └────────────┘  └────────────┘         │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ REST API Calls (JSON)
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │       Express.js Server (crawl-server) - Port 3000       │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │  │
│  │  │   Routes    │  │ Controllers │  │ Middleware  │     │  │
│  │  │             │  │             │  │             │     │  │
│  │  │ /api/tweets │  │ Analytics   │  │ Body Parser│     │  │
│  │  │ /api/stats  │  │ Clustering  │  │ CORS       │     │  │
│  │  │ /api/...    │  │ Twitter APIs│  │ Logger     │     │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Mongoose ODM
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  MongoDB (In-Memory or Local) - Port 27017              │  │
│  │                                                           │  │
│  │  Collections:                                            │  │
│  │  ├─ tweetsREST              (REST API tweets)           │  │
│  │  ├─ tweetsSTREAMNoFilter    (Random sample)             │  │
│  │  ├─ tweetsSTREAMKeywordFilter (Filtered by keywords)    │  │
│  │  └─ tweetsSTREAMLocationFilter (Geo-filtered)           │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            │ Data Persistence
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                               │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────┐   │
│  │ Twitter REST   │  │ Twitter Stream │  │ Plotly         │   │
│  │ API v1.1       │  │ API v1.1       │  │ Graphing       │   │
│  └────────────────┘  └────────────────┘  └────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**
- **Runtime:** Node.js v14+
- **Framework:** Express.js 4.21.2
- **Database:** MongoDB (or MongoDB Memory Server 10.1.2)
- **ODM:** Mongoose 8.9.3
- **Twitter Client:** Twit 2.2.11
- **Logging:** Winston 3.18.3
- **Analytics:**
  - async 3.2.6
  - minhash 0.0.9
  - stopword 3.1.5
  - plotly 1.0.6

**Frontend:**
- **Framework:** Angular 18.2.13
- **Language:** TypeScript 5.5.4
- **Reactive Programming:** RxJS 7.8.1
- **Change Detection:** Zone.js 0.14.10

**Development Tools:**
- **Build System:** Angular CLI, esbuild
- **Testing:** Karma, Jasmine
- **Package Manager:** npm

### Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    DATA COLLECTION FLOW                      │
└─────────────────────────────────────────────────────────────┘

1. TWITTER API REQUEST
   ├─ REST API: GET search/tweets
   │  └─ Parameters: query, count, geocode
   │
   ├─ Stream API: POST statuses/filter
   │  ├─ Track: keywords (e.g., "Glasgow", "Scotland")
   │  └─ Locations: bounding box coordinates
   │
   └─ Stream API: GET statuses/sample
      └─ Random 1% sample of all tweets

              ↓

2. DATA RECEIPT & VALIDATION
   ├─ JSON parsing
   ├─ Schema validation
   ├─ Extract relevant fields:
   │  ├─ id_str (unique identifier)
   │  ├─ text (tweet content)
   │  ├─ user (author information)
   │  ├─ place (geo-location data)
   │  ├─ created_at (timestamp)
   │  ├─ retweet_count
   │  ├─ favorite_count
   │  └─ is_quote_status

              ↓

3. CATEGORIZATION & STORAGE
   ├─ Determine collection based on source:
   │  ├─ REST → tweetsREST
   │  ├─ Sample Stream → tweetsSTREAMNoFilter
   │  ├─ Keyword Filter → tweetsSTREAMKeywordFilter
   │  └─ Location Filter → tweetsSTREAMLocationFilter
   │
   ├─ Save to MongoDB using Mongoose
   └─ Log success/failure

              ↓

4. ANALYTICS PROCESSING
   ├─ Count tweets per collection
   ├─ Identify geo-tagged tweets (place !== null)
   ├─ Calculate overlaps between collections
   ├─ Detect duplicates (same id_str)
   ├─ Count retweets (text starts with "RT")
   └─ Count quotes (is_quote_status === true)

              ↓

5. CLUSTERING (Optional)
   ├─ Extract all tweets from all collections
   ├─ Clean text:
   │  ├─ Remove emojis (regex)
   │  └─ Remove stopwords (20+ languages)
   │
   ├─ Generate MinHash signatures
   ├─ Build LSH index
   ├─ Query for similar tweets
   ├─ Group into clusters
   └─ Generate Plotly visualizations

              ↓

6. RESULT OUTPUT
   ├─ Write to logs (Winston)
   ├─ Write to final output file
   ├─ Generate Plotly graphs (uploaded to Plotly cloud)
   └─ Return via API (if requested)
```

---

## Getting Started

### Prerequisites

**Required Software:**
- **Node.js:** Version 14 or higher (Recommended: v18 or v20)
  - Check: `node --version`
  - Download: https://nodejs.org/

- **npm:** Comes with Node.js (v6+)
  - Check: `npm --version`

**Optional Software:**
- **MongoDB:** Only if not using MongoDB Memory Server
  - Download: https://www.mongodb.com/try/download/community
  - The application now works WITHOUT MongoDB installed!

- **Git:** For version control
  - Check: `git --version`
  - Download: https://git-scm.com/

**Twitter API Access:**
- Twitter Developer Account
- API Keys and Access Tokens
- Sign up: https://developer.twitter.com/

### Installation

#### Step 1: Clone or Download the Repository

**Option A: Using Git**
```bash
git clone <repository-url>
cd twitterWebScience
```

**Option B: Download ZIP**
1. Download project ZIP file
2. Extract to desired location
3. Open terminal/command prompt in project folder

#### Step 2: Install Backend Dependencies

```bash
cd crawl-server
npm install
```

**Expected Output:**
```
added 210 packages in 15s
```

**What Gets Installed:**
- Express.js and middleware
- Mongoose for MongoDB
- Winston for logging
- Twitter API client (Twit)
- Analytics libraries
- MongoDB Memory Server (for testing without MongoDB)

#### Step 3: Install Frontend Dependencies

```bash
cd ../crawl-ui
npm install --legacy-peer-deps
```

**Note:** The `--legacy-peer-deps` flag is needed due to the Angular 18 upgrade.

**Expected Output:**
```
added 1006 packages in 54s
```

**What Gets Installed:**
- Angular 18 framework and CLI
- TypeScript compiler
- RxJS for reactive programming
- Build tools and test frameworks

#### Step 4: Configure Twitter API Keys

**For Testing (Default):**
- Application works with mock keys
- Analytics run on empty database
- No Twitter data collection

**For Production (Data Collection):**

1. Get your Twitter API credentials from https://developer.twitter.com/
2. Open `crawl-server/access-key/access.json`
3. Replace mock values with your real keys:

```json
{
    "consumer_key": "YOUR_CONSUMER_KEY_HERE",
    "consumer_secret_key": "YOUR_CONSUMER_SECRET_HERE",
    "access_token": "YOUR_ACCESS_TOKEN_HERE",
    "access_secret_token": "YOUR_ACCESS_SECRET_HERE"
}
```

4. Uncomment Twitter API modules in `crawl-server/app.js` (lines 16-20)
5. Uncomment data collection code in `crawl-server/app.js` (lines 77-125)

#### Step 5: Configure Database

**Option A: Use MongoDB Memory Server (Default - Recommended for Testing)**
- No configuration needed!
- Database runs in RAM
- Perfect for development and testing

**Option B: Use Local MongoDB**
1. Install MongoDB Community Server
2. Start MongoDB service
3. Edit `crawl-server/model/config.js`:
```javascript
module.exports = {
  url: 'mongodb://127.0.0.1/sampleData',
  useMemoryServer: false  // Change to false
}
```

### Quick Start

**Terminal 1 - Start Backend:**
```bash
cd crawl-server
npm start
```

**Expected Output:**
```
info: Starting the server at port number 3000
info: MongoDB Memory Server started successfully
info: Successfully connected to database
info: Analytics completed successfully
```

**Terminal 2 - Start Frontend (Optional):**
```bash
cd crawl-ui
npm start
```

**Expected Output:**
```
✔ Browser application bundle generation complete.
** Angular Live Development Server is listening on localhost:4200
```

**Access the Application:**
- Backend API: http://localhost:3000
- Frontend UI: http://localhost:4200

---

## User Guide

### Understanding the Application

#### What the Application Does

**1. Data Collection Phase:**
The application can collect tweets through multiple channels simultaneously:

- **REST API Collection:**
  - Searches for specific tweets matching keywords
  - Can retrieve historical tweets (up to 7 days old)
  - Limited to 180 requests per 15 minutes (Twitter limit)
  - Example: Search for "Glasgow weather" tweets

- **Streaming API Collection:**
  - **Random Sample Stream:** Receives ~1% random sample of all tweets
  - **Keyword Filter Stream:** Real-time tweets containing specific words/phrases
  - **Location Filter Stream:** Real-time tweets from specific geographic areas
  - Runs continuously until manually stopped
  - Example: Stream all tweets mentioning "Glasgow" in real-time

**2. Storage Phase:**
Tweets are automatically categorized and stored in separate MongoDB collections:

- `tweetsREST`: Tweets collected via REST API
- `tweetsSTREAMNoFilter`: Random sample tweets
- `tweetsSTREAMKeywordFilter`: Keyword-filtered tweets
- `tweetsSTREAMLocationFilter`: Location-filtered tweets

**3. Analysis Phase:**
The application runs comprehensive analytics on collected data:

- **Count Analysis:**
  - Total tweets per collection
  - Total tweets overall
  - Geo-tagged tweet counts

- **Overlap Analysis:**
  - Finds tweets appearing in multiple collections
  - Identifies redundant data

- **Engagement Analysis:**
  - Counts retweets (tweets starting with "RT")
  - Counts quote tweets
  - Tracks engagement metrics

- **Geographic Analysis:**
  - Identifies tweets with location data
  - Counts Glasgow-specific tweets
  - Counts UK-based tweets

**4. Clustering Phase (Advanced):**
Groups similar tweets together using MinHash LSH algorithm:

- Removes noise (emojis, stopwords in 20+ languages)
- Calculates tweet similarity
- Forms clusters of related content
- Generates visual graphs showing cluster distribution

### Using the Application

#### Scenario 1: Testing Mode (Default Setup)

**Perfect for: Learning, development, testing without Twitter API access**

**What You Can Do:**
1. Start the backend server
2. Verify all components are working
3. See how analytics run on empty database
4. Test API endpoints
5. Practice with the system before collecting real data

**Steps:**
```bash
# Start backend
cd crawl-server
npm start
```

**What Happens:**
- Server starts successfully
- MongoDB Memory Server initializes
- Analytics run (showing 0 counts - database is empty)
- Application stays running, ready for requests

**Viewing Results:**
Check logs in `crawl-server/Twitter-Crawler-Logs/` folder:
```
DD-MM-YYYY.log - Contains all activity logs
```

#### Scenario 2: Data Collection Mode

**Perfect for: Actual research, data gathering, analysis**

**Prerequisites:**
- Valid Twitter API credentials
- Configured `access.json` with real keys
- Uncommented Twitter API code in `app.js`

**Starting Data Collection:**

1. **Configure Collection Parameters:**
   Edit `crawl-server/controller/keywords.js` to set keywords:
   ```javascript
   module.exports = ['Glasgow', 'Scotland', 'UK', 'weather'];
   ```

2. **Start Server:**
   ```bash
   cd crawl-server
   npm start
   ```

3. **Monitor Collection:**
   Watch the console for incoming tweets:
   ```
   info: Tweet received by user: @username
   info: Tweet saved to database
   ```

4. **Collection Will Run:**
   - REST API: Completes search and stops
   - Streaming: Continues until manually stopped (Ctrl+C)

**Stopping Collection:**
- Press `Ctrl+C` in terminal
- Streaming APIs stop gracefully
- Data remains in database

#### Scenario 3: Analysis Only Mode

**Perfect for: Re-analyzing existing data, generating new reports**

**Prerequisites:**
- Database with existing tweet data
- Or sample data imported

**Running Analytics:**

Analytics run automatically on server start. To run manually:

```javascript
// In Node.js console or separate script
const analytics = require('./controller/analytics');

// Run all analytics
await analytics.countTotalTweetsCollected();
await analytics.countGeoTaggedTweetsAndOverlappingData();
await analytics.totalRedundantDataInCollections();
await analytics.totalRetweetsQuotesCount();
```

**Viewing Results:**
1. **Console Output:** Real-time results in terminal
2. **Log Files:** `Twitter-Crawler-Logs/DD-MM-YYYY.log`
3. **Final Output:** `Twitter-Crawler-Final-Output-Log/DD-MM-YYYY.log`

#### Scenario 4: Clustering Analysis

**Perfect for: Finding related tweets, topic detection, content analysis**

**Running Clustering:**

**Note:** Clustering is currently commented out (complex Mongoose 8 refactoring pending). To use:

1. Uncomment in `app.js` line 161:
   ```javascript
   await clustering.minhashLshClustering();
   ```

2. Ensure you have tweets in database

3. Start server - clustering runs automatically

**What Clustering Does:**
```
1. Loads all tweets from all collections
2. Cleans tweet text:
   - Removes emojis
   - Removes stopwords (the, is, are, etc.) in 20+ languages
3. Generates MinHash signatures (fingerprints)
4. Builds LSH index for fast similarity search
5. Groups similar tweets into clusters
6. Analyzes clusters:
   - Size distribution (1, 2, 3-4, 5-9, etc.)
   - Geographic distribution
   - Glasgow vs non-Glasgow clusters
7. Generates Plotly graphs
8. Uploads graphs to Plotly cloud
9. Returns graph URLs in logs
```

**Reading Clustering Results:**

Check `Twitter-Crawler-Final-Output-Log/` for graph URLs:
```
Link to check the graph for the size of clusters formed by Minhash LSH: https://plot.ly/~username/1
Link to check the graph for the number of geo-tagged clusters: https://plot.ly/~username/2
```

### Interpreting Results

#### Analytics Output Explained

**Example Output:**
```
info: Number of tweets collected using REST API: 150
info: Number of tweets collected using no filter stream: 5432
info: Number of tweets collected using keyword filter stream: 892
info: Number of tweets collected using location filter stream: 234
info: Total number of tweets collected using REST and STREAM are: 6708
info: Total number of geo-tagged tweets collected using REST and STREAM are: 456
info: Number of geo tagged tweets collected using location filter stream: 234
info: Total overlapping data found between Geo-tagged and No Filter Streamed Data: 12
info: Total redundant data present in all the collections is: 45
info: Total retweeted tweets present in all the collections is: 2890
info: Total quoted tweets present in all the collections is: 567
```

**What Each Metric Means:**

**Total Tweets:** 6,708
- This is all unique tweets collected across all methods
- Shows overall collection volume

**Geo-tagged Tweets:** 456 (6.8%)
- Tweets with place/location information
- Important for geographic analysis
- Lower percentage is typical (most tweets don't have location)

**REST API Tweets:** 150
- Tweets from targeted searches
- Usually most relevant to research question
- Limited by API rate limits

**Stream Tweets:** 6,558
- Real-time collected tweets
- Higher volume than REST
- May include less relevant tweets

**Overlapping Data:** 12
- Same tweet appeared in multiple collections
- Example: Tweet from Glasgow appeared in both location stream AND keyword stream
- Helps understand data redundancy

**Redundant Data:** 45
- Duplicate tweets in database
- Should be minimal with good deduplication
- Can be cleaned if needed

**Retweets:** 2,890 (43%)
- Shared content (RT @username...)
- High percentage is normal on Twitter
- Important for measuring content spread

**Quote Tweets:** 567 (8.5%)
- Tweets with added commentary
- Shows engagement and conversation
- Lower than retweets typically

#### Cluster Analysis Results

**Example Graph Interpretation:**

**Cluster Size Distribution:**
```
1 tweet:    1,234 clusters (singles - unique tweets)
2 tweets:   567 clusters (pairs)
3-4 tweets: 234 clusters (small groups)
5-9 tweets: 89 clusters (medium groups)
10-19:      23 clusters (large groups)
20-49:      5 clusters (very large)
50+:        1 cluster (mega cluster - trending topic)
```

**What This Tells You:**
- Majority are singles: Diverse content, many unique topics
- Large clusters (50+): Trending topics, breaking news, viral content
- Medium clusters (5-19): Common themes, recurring discussions

**Geographic Cluster Distribution:**
```
Glasgow clusters: 34
UK clusters: 67
No location clusters: 1,234
Other location clusters: 789
```

**Insights:**
- Most clusters lack location (expected)
- Glasgow-specific content is clustered (local discussion)
- UK-wide topics also group together

---

## Developer Guide

### Project Structure

```
twitterWebScience/
│
├── crawl-server/                    # Backend application
│   ├── access-key/
│   │   └── access.json             # Twitter API credentials
│   ├── controller/
│   │   ├── analytics.js            # Analytics functions
│   │   ├── clustering.js           # Clustering algorithm
│   │   ├── getTweetsRouter.js      # Express routes
│   │   └── keywords.js             # Keywords for filtering
│   ├── logger-config/
│   │   ├── log-config.js           # Winston logger setup
│   │   └── finalOutput.js          # Final output logger
│   ├── model/
│   │   ├── config.js               # Database configuration
│   │   ├── tweetsSchema.js         # Mongoose schemas
│   │   └── mongoMemoryServer.js    # In-memory DB helper
│   ├── twitterAPIs/
│   │   ├── restCall.js             # REST API collection
│   │   ├── noFilterStreamCall.js   # Random stream
│   │   ├── keywordFilterStream.js  # Keyword stream
│   │   └── locationFilterStream.js # Location stream
│   ├── Twitter-Crawler-Logs/       # Generated logs
│   ├── Twitter-Crawler-Final-Output-Log/  # Final results
│   ├── app.js                      # Main server file
│   ├── package.json                # Dependencies
│   └── package-lock.json
│
├── crawl-ui/                        # Frontend application
│   ├── src/
│   │   ├── app/
│   │   │   ├── app.component.ts    # Root component
│   │   │   ├── app.component.html  # Root template
│   │   │   ├── app.component.css   # Root styles
│   │   │   └── app.module.ts       # Root module
│   │   ├── assets/                 # Static assets
│   │   ├── environments/           # Environment configs
│   │   ├── index.html              # Main HTML
│   │   ├── main.ts                 # Bootstrap file
│   │   ├── polyfills.ts            # Browser polyfills
│   │   └── styles.css              # Global styles
│   ├── angular.json                # Angular configuration
│   ├── tsconfig.json               # TypeScript config
│   ├── package.json                # Dependencies
│   └── package-lock.json
│
└── docs/                            # Documentation
    ├── COMPLETE_UPGRADE_DOCUMENTATION.md
    ├── UPGRADE_COMPLETE.md
    ├── UPGRADE_PROGRESS.md
    └── APPLICATION_GUIDE.md (this file)
```

### Adding New Features

#### Adding a New Analytics Function

**Example: Add "Average Tweet Length" Calculator**

**Step 1: Create Function in analytics.js**
```javascript
// In crawl-server/controller/analytics.js

exports.calculateAverageTweetLength = async function () {
    try {
        let totalLength = 0;
        let tweetCount = 0;

        // Get all tweets from REST collection
        const restTweets = await TweetsDB.tweetsREST.find({}).exec();

        for (const tweet of restTweets) {
            totalLength += tweet.text.length;
            tweetCount++;
        }

        // Calculate average
        const averageLength = tweetCount > 0 ? totalLength / tweetCount : 0;

        logger.info(`Average tweet length: ${averageLength.toFixed(2)} characters`);
        output.info(`Average tweet length: ${averageLength.toFixed(2)} characters`);

        return averageLength;
    } catch (err) {
        logger.error('Error calculating average tweet length: ' + JSON.stringify(err));
        return 0;
    }
}
```

**Step 2: Call Function in app.js**
```javascript
// In crawl-server/app.js, around line 154

(async () => {
    try {
        await analytics.countTotalTweetsCollected();
        await analytics.countGeoTaggedTweetsAndOverlappingData();
        await analytics.totalRedundantDataInCollections();
        await analytics.totalRetweetsQuotesCount();
        await analytics.calculateAverageTweetLength();  // ADD THIS LINE
        logger.info('Analytics completed successfully');
    } catch (err) {
        logger.error('Error in analytics: ' + JSON.stringify(err));
    }
})();
```

**Step 3: Test**
```bash
npm start
# Check logs for "Average tweet length" output
```

#### Adding a New API Endpoint

**Example: Create Endpoint to Get Tweet Count**

**Step 1: Create Route in getTweetsRouter.js**
```javascript
// In crawl-server/controller/getTweetsRouter.js

const express = require('express');
const router = express.Router();
const TweetsDB = require('../model/tweetsSchema');

// GET /api/tweets/count
router.get('/count', async (req, res) => {
    try {
        const restCount = await TweetsDB.tweetsREST.countDocuments().exec();
        const streamCount = await TweetsDB.tweetsSTREAMNoFilter.countDocuments().exec();
        const keywordCount = await TweetsDB.tweetsSTREAMKeywordFilter.countDocuments().exec();
        const locationCount = await TweetsDB.tweetsSTREAMLocationFilter.countDocuments().exec();

        const total = restCount + streamCount + keywordCount + locationCount;

        res.json({
            success: true,
            data: {
                rest: restCount,
                stream: streamCount,
                keyword: keywordCount,
                location: locationCount,
                total: total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
```

**Step 2: Register Route in app.js**
```javascript
// In crawl-server/app.js

const getTweetsRouter = require('./controller/getTweetsRouter');
app.use('/api/tweets', getTweetsRouter);
```

**Step 3: Test Endpoint**
```bash
# Start server
npm start

# In another terminal
curl http://localhost:3000/api/tweets/count
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "rest": 150,
    "stream": 5432,
    "keyword": 892,
    "location": 234,
    "total": 6708
  }
}
```

### Debugging

#### Common Issues and Solutions

**Issue: "Cannot find module 'mongoose'"**
```bash
# Solution: Install dependencies
cd crawl-server
npm install
```

**Issue: "MongooseError: Model.find() no longer accepts a callback"**
```
# Solution: Using old code version
# Make sure you have the updated files with async/await
# Check that analytics.js has been updated
```

**Issue: Server crashes with "EADDRINUSE: address already in use"**
```bash
# Solution: Port 3000 is already taken

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac:
lsof -i :3000
kill -9 <PID>

# Or change port in app.js:
const port = 3001;  // Change to different port
```

**Issue: No tweets being collected**
```
# Check:
1. Are Twitter API credentials correct?
2. Is Twitter API code uncommented in app.js?
3. Are you within Twitter rate limits?
4. Check Twitter-Crawler-Logs for error messages
```

#### Logging Best Practices

**Use Appropriate Log Levels:**
```javascript
logger.error('Critical problem: ' + error);  // Errors that stop functionality
logger.warn('Potential issue: ' + warning);   // Problems that don't stop execution
logger.info('Normal operation: ' + info);     // Important events
logger.verbose('Detailed info: ' + detail);   // Extra information
logger.debug('Debug info: ' + debug);         // Development debugging
```

**Always Log:**
- Database connection status
- API call success/failure
- Data processing steps
- Error details with context

**Example:**
```javascript
try {
    const tweets = await TweetsDB.tweetsREST.find({}).exec();
    logger.info(`Successfully retrieved ${tweets.length} tweets from REST collection`);
    // Process tweets...
} catch (err) {
    logger.error(`Failed to retrieve tweets from REST collection: ${err.message}`);
    logger.error(`Stack trace: ${err.stack}`);
}
```

---

## Deployment Guide

### Production Deployment

#### Environment Setup

**1. Server Requirements:**
- **CPU:** 2+ cores recommended
- **RAM:** 4GB minimum, 8GB recommended
- **Storage:** 20GB+ (depends on data volume)
- **OS:** Ubuntu 20.04 LTS, CentOS 8, or Windows Server 2019

**2. Install Dependencies:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version  # Should show v18.x.x
npm --version   # Should show v9.x.x

# Install MongoDB (if not using Memory Server)
# Follow: https://docs.mongodb.com/manual/installation/
```

**3. Clone Repository:**
```bash
cd /var/www
sudo git clone <repository-url> twitterWebScience
cd twitterWebScience
```

**4. Install Application Dependencies:**
```bash
# Backend
cd crawl-server
npm install --production
cd ..

# Frontend
cd crawl-ui
npm install --production --legacy-peer-deps
npm run build
cd ..
```

**5. Configure Production Settings:**

**Database Configuration:**
```javascript
// crawl-server/model/config.js
module.exports = {
  url: 'mongodb://localhost:27017/twitterProduction',
  useMemoryServer: false  // Use real MongoDB in production
}
```

**Twitter API Configuration:**
```bash
# Set environment variables instead of hardcoding
export TWITTER_CONSUMER_KEY="your_key"
export TWITTER_CONSUMER_SECRET="your_secret"
export TWITTER_ACCESS_TOKEN="your_token"
export TWITTER_ACCESS_SECRET="your_secret"
```

**Update access.json to use environment variables:**
```javascript
// crawl-server/access-key/access.js (rename from .json)
module.exports = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret_key: process.env.TWITTER_CONSUMER_SECRET,
    access_token: process.env.TWITTER_ACCESS_TOKEN,
    access_secret_token: process.env.TWITTER_ACCESS_SECRET
}
```

#### Using Process Manager (PM2)

**Install PM2:**
```bash
sudo npm install -g pm2
```

**Start Application:**
```bash
cd /var/www/twitterWebScience/crawl-server
pm2 start app.js --name twitter-crawler
```

**PM2 Commands:**
```bash
pm2 list              # Show all processes
pm2 logs              # View logs
pm2 stop twitter-crawler   # Stop application
pm2 restart twitter-crawler # Restart application
pm2 delete twitter-crawler  # Remove from PM2

# Start on system boot
pm2 startup
pm2 save
```

#### Nginx Reverse Proxy

**Install Nginx:**
```bash
sudo apt install nginx
```

**Configure:**
```nginx
# /etc/nginx/sites-available/twitter-crawler
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/twitterWebScience/crawl-ui/dist/crawl-ui/browser;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/twitter-crawler /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL/HTTPS with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

### Docker Deployment

**Dockerfile (Backend):**
```dockerfile
# crawl-server/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
```

**Dockerfile (Frontend):**
```dockerfile
# crawl-ui/Dockerfile
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/crawl-ui/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**docker-compose.yml:**
```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    build: ./crawl-server
    ports:
      - "3000:3000"
    environment:
      - MONGODB_URI=mongodb://mongodb:27017/twitterData
      - TWITTER_CONSUMER_KEY=${TWITTER_CONSUMER_KEY}
      - TWITTER_CONSUMER_SECRET=${TWITTER_CONSUMER_SECRET}
      - TWITTER_ACCESS_TOKEN=${TWITTER_ACCESS_TOKEN}
      - TWITTER_ACCESS_SECRET=${TWITTER_ACCESS_SECRET}
    depends_on:
      - mongodb
    volumes:
      - ./crawl-server/Twitter-Crawler-Logs:/app/Twitter-Crawler-Logs

  frontend:
    build: ./crawl-ui
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mongo-data:
```

**Run with Docker:**
```bash
docker-compose up -d
```

---

## Maintenance & Operations

### Monitoring

#### Log Management

**Log Locations:**
```
crawl-server/Twitter-Crawler-Logs/
├── 03-11-2025.log          # Today's logs
├── 02-11-2025.log          # Yesterday's logs
└── ...

crawl-server/Twitter-Crawler-Final-Output-Log/
└── 03-11-2025.log          # Analytics results
```

**Log Rotation:**
Logs automatically rotate daily (configured in Winston).

**Viewing Logs:**
```bash
# View latest logs
tail -f Twitter-Crawler-Logs/$(date +%d-%m-%Y).log

# Search for errors
grep ERROR Twitter-Crawler-Logs/*.log

# Count tweets collected today
grep "saved to database" Twitter-Crawler-Logs/$(date +%d-%m-%Y).log | wc -l
```

#### Performance Monitoring

**Monitor Memory Usage:**
```javascript
// Add to app.js
setInterval(() => {
    const used = process.memoryUsage();
    logger.info(`Memory: ${Math.round(used.heapUsed / 1024 / 1024)} MB`);
}, 60000);  // Every minute
```

**Monitor Database Size:**
```javascript
// Add analytics function
exports.checkDatabaseSize = async function() {
    const stats = await mongoose.connection.db.stats();
    logger.info(`Database size: ${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`);
}
```

### Backup & Recovery

#### Database Backup

**Manual Backup:**
```bash
mongodump --db sampleData --out /backup/$(date +%Y%m%d)
```

**Automated Daily Backup (Cron):**
```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * mongodump --db sampleData --out /backup/$(date +\%Y\%m\%d)
```

**Restore from Backup:**
```bash
mongorestore --db sampleData /backup/20251103/sampleData/
```

### Troubleshooting Production Issues

**High Memory Usage:**
```bash
# Check Node.js process
top -p $(pgrep -f "node app.js")

# If memory leak suspected:
pm2 restart twitter-crawler
```

**Database Connection Issues:**
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection
mongo --eval "db.adminCommand('ping')"

# Restart MongoDB if needed
sudo systemctl restart mongod
```

**Application Not Responding:**
```bash
# Check if process is running
pm2 list

# Check error logs
pm2 logs twitter-crawler --err

# Restart if needed
pm2 restart twitter-crawler
```

---

## Appendix

### Glossary

**API (Application Programming Interface):** Interface for software communication
**Async/Await:** Modern JavaScript pattern for handling asynchronous operations
**Clustering:** Grouping similar items together
**Collection:** MongoDB database table
**Express.js:** Web application framework for Node.js
**Geo-tagged:** Tweet with location information
**LSH (Locality-Sensitive Hashing):** Algorithm for finding similar items efficiently
**MinHash:** Technique for estimating similarity between sets
**Mongoose:** MongoDB object modeling library
**ODM (Object Document Mapper):** Translates between code and database
**REST API:** Architectural style for web services
**Retweet:** Sharing someone else's tweet
**Stopword:** Common word (the, is, are) typically removed from analysis
**Streaming API:** Real-time data feed
**Winston:** Logging library for Node.js

### Additional Resources

**Official Documentation:**
- Node.js: https://nodejs.org/docs/
- Express.js: https://expressjs.com/
- MongoDB: https://docs.mongodb.com/
- Mongoose: https://mongoosejs.com/docs/
- Angular: https://angular.io/docs
- Twitter API: https://developer.twitter.com/en/docs

**Learning Resources:**
- JavaScript async/await: https://javascript.info/async-await
- MongoDB Tutorial: https://www.mongodb.com/docs/manual/tutorial/
- Angular Tutorial: https://angular.io/tutorial

### Support

**Issues & Bugs:**
- Check logs first: `Twitter-Crawler-Logs/`
- Review this documentation
- Check GitHub Issues (if applicable)

**Contributing:**
- Follow existing code style
- Add tests for new features
- Update documentation
- Submit pull requests

---

**End of Application Guide**
**Version 2.0 | November 2025**
