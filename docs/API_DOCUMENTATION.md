# Twitter Web Science Crawler - API Documentation

**Version:** 2.0
**Base URL:** `http://localhost:3000`
**Last Updated:** November 3, 2025

---

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Examples](#examples)

---

## Introduction

### Overview

The Twitter Web Science Crawler API provides programmatic access to tweet collection, storage, and analysis functions. The API follows REST principles and returns JSON responses.

### Base URL

```
Development: http://localhost:3000
Production: https://your-domain.com
```

### API Version

Current version: **v1** (not explicitly versioned in URLs)

### Response Format

All responses are in JSON format:

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-03T12:34:56.789Z"
  }
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request succeeded |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - Resource not found |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Server overloaded or down |

---

## Authentication

### Current Implementation

**Note:** The current version does not implement authentication. All endpoints are publicly accessible when the server is running.

### Future Implementation

For production deployment, consider adding:

```javascript
// Example JWT authentication middleware
const jwt = require('jsonwebtoken');

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
}

// Use in routes
app.get('/api/tweets', authenticateToken, handler);
```

---

## API Endpoints

### Tweet Collection Endpoints

#### 1. Get All Tweets (REST Collection)

**Endpoint:** `GET /api/tweets/rest`

**Description:** Retrieves all tweets collected via Twitter REST API.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "tweets": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "id_str": "1234567890123456789",
        "text": "Example tweet text",
        "user": {
          "screen_name": "username",
          "name": "User Name"
        },
        "created_at": "Wed Oct 10 20:19:24 +0000 2018",
        "place": {
          "name": "Glasgow",
          "country_code": "GB"
        },
        "retweet_count": 5,
        "favorite_count": 10
      }
    ],
    "count": 1
  },
  "meta": {
    "timestamp": "2025-11-03T12:34:56.789Z"
  }
}
```

**Example Request:**
```bash
curl http://localhost:3000/api/tweets/rest
```

**Implementation:**
```javascript
router.get('/rest', async (req, res) => {
    try {
        const tweets = await TweetsDB.tweetsREST.find({}).exec();
        res.json({
            success: true,
            data: {
                tweets: tweets,
                count: tweets.length
            },
            meta: {
                timestamp: new Date().toISOString()
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

---

#### 2. Get Stream Tweets (No Filter)

**Endpoint:** `GET /api/tweets/stream/nofilter`

**Description:** Retrieves all tweets from the random sample stream.

**Parameters:**
- `limit` (optional): Number of tweets to return (default: all)
- `skip` (optional): Number of tweets to skip for pagination (default: 0)

**Query String:**
```
/api/tweets/stream/nofilter?limit=100&skip=0
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tweets": [...],
    "count": 100,
    "total": 5432
  },
  "pagination": {
    "limit": 100,
    "skip": 0,
    "hasMore": true
  }
}
```

**Example Request:**
```bash
curl "http://localhost:3000/api/tweets/stream/nofilter?limit=50&skip=0"
```

**Implementation:**
```javascript
router.get('/stream/nofilter', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 0;
        const skip = parseInt(req.query.skip) || 0;

        const total = await TweetsDB.tweetsSTREAMNoFilter.countDocuments().exec();
        const tweets = await TweetsDB.tweetsSTREAMNoFilter
            .find({})
            .limit(limit)
            .skip(skip)
            .exec();

        res.json({
            success: true,
            data: {
                tweets: tweets,
                count: tweets.length,
                total: total
            },
            pagination: {
                limit: limit,
                skip: skip,
                hasMore: (skip + tweets.length) < total
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

---

#### 3. Get Keyword Filtered Tweets

**Endpoint:** `GET /api/tweets/stream/keyword`

**Description:** Retrieves tweets filtered by keywords.

**Parameters:**
- `keyword` (optional): Filter by specific keyword
- `limit` (optional): Number of results
- `skip` (optional): Pagination offset

**Response:**
```json
{
  "success": true,
  "data": {
    "tweets": [...],
    "count": 50
  }
}
```

**Example Request:**
```bash
curl "http://localhost:3000/api/tweets/stream/keyword?keyword=Glasgow&limit=50"
```

---

#### 4. Get Location Filtered Tweets

**Endpoint:** `GET /api/tweets/stream/location`

**Description:** Retrieves geo-tagged tweets from location filter stream.

**Parameters:**
- `place` (optional): Filter by place name
- `country_code` (optional): Filter by country code (e.g., "GB")

**Response:**
```json
{
  "success": true,
  "data": {
    "tweets": [...],
    "count": 234
  }
}
```

**Example Request:**
```bash
curl "http://localhost:3000/api/tweets/stream/location?place=Glasgow"
curl "http://localhost:3000/api/tweets/stream/location?country_code=GB"
```

---

### Analytics Endpoints

#### 5. Get Tweet Statistics

**Endpoint:** `GET /api/analytics/stats`

**Description:** Returns comprehensive statistics about collected tweets.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "collections": {
      "rest": 150,
      "streamNoFilter": 5432,
      "streamKeyword": 892,
      "streamLocation": 234
    },
    "totals": {
      "allTweets": 6708,
      "geoTagged": 456,
      "retweets": 2890,
      "quotes": 567
    },
    "percentages": {
      "geoTaggedPercent": 6.8,
      "retweetPercent": 43.1,
      "quotePercent": 8.5
    },
    "overlap": {
      "locationNoFilter": 12,
      "totalRedundant": 45
    }
  },
  "meta": {
    "timestamp": "2025-11-03T12:34:56.789Z",
    "generatedIn": "234ms"
  }
}
```

**Example Request:**
```bash
curl http://localhost:3000/api/analytics/stats
```

**Implementation:**
```javascript
router.get('/stats', async (req, res) => {
    const startTime = Date.now();

    try {
        // Count tweets per collection
        const restCount = await TweetsDB.tweetsREST.countDocuments().exec();
        const streamNoFilterCount = await TweetsDB.tweetsSTREAMNoFilter.countDocuments().exec();
        const streamKeywordCount = await TweetsDB.tweetsSTREAMKeywordFilter.countDocuments().exec();
        const streamLocationCount = await TweetsDB.tweetsSTREAMLocationFilter.countDocuments().exec();

        const totalTweets = restCount + streamNoFilterCount + streamKeywordCount + streamLocationCount;

        // Count geo-tagged tweets
        const geoTaggedRest = await TweetsDB.tweetsREST.find({ "place": { $ne: null } }).exec();
        const geoTaggedStream = await TweetsDB.tweetsSTREAMNoFilter.find({ "place": { $ne: null } }).exec();
        const geoTaggedKeyword = await TweetsDB.tweetsSTREAMKeywordFilter.find({ "place": { $ne: null } }).exec();
        const geoTaggedLocation = await TweetsDB.tweetsSTREAMLocationFilter.find({ "place": { $ne: null } }).exec();

        const totalGeoTagged = geoTaggedRest.length + geoTaggedStream.length +
                               geoTaggedKeyword.length + geoTaggedLocation.length;

        // Count retweets and quotes
        let retweetCount = 0;
        let quoteCount = 0;

        const allCollections = [
            TweetsDB.tweetsREST,
            TweetsDB.tweetsSTREAMNoFilter,
            TweetsDB.tweetsSTREAMKeywordFilter,
            TweetsDB.tweetsSTREAMLocationFilter
        ];

        for (const collection of allCollections) {
            const tweets = await collection.find({}).exec();
            for (const tweet of tweets) {
                if (tweet.text && tweet.text.substring(0, 2) === "RT") {
                    retweetCount++;
                }
                if (tweet.is_quote_status) {
                    quoteCount++;
                }
            }
        }

        const processingTime = Date.now() - startTime;

        res.json({
            success: true,
            data: {
                collections: {
                    rest: restCount,
                    streamNoFilter: streamNoFilterCount,
                    streamKeyword: streamKeywordCount,
                    streamLocation: streamLocationCount
                },
                totals: {
                    allTweets: totalTweets,
                    geoTagged: totalGeoTagged,
                    retweets: retweetCount,
                    quotes: quoteCount
                },
                percentages: {
                    geoTaggedPercent: totalTweets > 0 ? ((totalGeoTagged / totalTweets) * 100).toFixed(2) : 0,
                    retweetPercent: totalTweets > 0 ? ((retweetCount / totalTweets) * 100).toFixed(2) : 0,
                    quotePercent: totalTweets > 0 ? ((quoteCount / totalTweets) * 100).toFixed(2) : 0
                }
            },
            meta: {
                timestamp: new Date().toISOString(),
                generatedIn: `${processingTime}ms`
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

---

#### 6. Get Geographic Analysis

**Endpoint:** `GET /api/analytics/geographic`

**Description:** Returns geographic distribution of tweets.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "byPlace": {
      "Glasgow": 234,
      "Edinburgh": 45,
      "London": 123,
      "Other": 54
    },
    "byCountry": {
      "GB": 402,
      "US": 34,
      "CA": 12,
      "Other": 8
    },
    "geoTaggedTotal": 456,
    "noGeoTag": 6252
  }
}
```

**Example Request:**
```bash
curl http://localhost:3000/api/analytics/geographic
```

---

#### 7. Get Top Users

**Endpoint:** `GET /api/analytics/top-users`

**Description:** Returns users with most tweets in collection.

**Parameters:**
- `limit` (optional): Number of top users to return (default: 10)

**Response:**
```json
{
  "success": true,
  "data": {
    "topUsers": [
      {
        "username": "user1",
        "tweetCount": 45,
        "totalRetweets": 234,
        "totalFavorites": 567
      },
      {
        "username": "user2",
        "tweetCount": 38,
        "totalRetweets": 189,
        "totalFavorites": 445
      }
    ]
  }
}
```

**Example Request:**
```bash
curl "http://localhost:3000/api/analytics/top-users?limit=20"
```

---

### Search Endpoints

#### 8. Search Tweets

**Endpoint:** `GET /api/tweets/search`

**Description:** Search tweets by text content.

**Parameters:**
- `q` (required): Search query
- `collection` (optional): Specific collection to search (rest, stream, keyword, location)
- `limit` (optional): Number of results (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "query": "Glasgow weather",
    "results": [...],
    "count": 15
  }
}
```

**Example Request:**
```bash
curl "http://localhost:3000/api/tweets/search?q=Glasgow%20weather&limit=20"
```

**Implementation:**
```javascript
router.get('/search', async (req, res) => {
    try {
        const query = req.query.q;
        if (!query) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter "q" is required'
            });
        }

        const limit = parseInt(req.query.limit) || 50;
        const collection = req.query.collection;

        let results = [];

        // Search in specified collection or all collections
        if (!collection || collection === 'rest') {
            const restResults = await TweetsDB.tweetsREST
                .find({ text: { $regex: query, $options: 'i' } })
                .limit(limit)
                .exec();
            results = results.concat(restResults);
        }

        // ... similar for other collections

        res.json({
            success: true,
            data: {
                query: query,
                results: results.slice(0, limit),
                count: results.length
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

---

### Clustering Endpoints

#### 9. Get Cluster Analysis

**Endpoint:** `GET /api/clustering/analyze`

**Description:** Returns cluster analysis results (requires clustering to be run first).

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "totalClusters": 2123,
    "clusterSizes": {
      "single": 1234,
      "pairs": 567,
      "small": 234,
      "medium": 89,
      "large": 23,
      "veryLarge": 5,
      "mega": 1
    },
    "geographic": {
      "glasgowClusters": 34,
      "ukClusters": 67,
      "noLocation": 1234
    },
    "graphUrls": {
      "sizeDistribution": "https://plot.ly/~username/1",
      "geoTagged": "https://plot.ly/~username/2",
      "userGeo": "https://plot.ly/~username/3"
    }
  }
}
```

**Example Request:**
```bash
curl http://localhost:3000/api/clustering/analyze
```

---

### Administrative Endpoints

#### 10. Get Server Status

**Endpoint:** `GET /api/status`

**Description:** Returns server health and status information.

**Parameters:** None

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "running",
    "uptime": 123456,
    "version": "2.0",
    "database": {
      "connected": true,
      "type": "MongoDB Memory Server"
    },
    "memory": {
      "used": 145.67,
      "total": 512,
      "unit": "MB"
    },
    "collections": {
      "rest": "ready",
      "stream": "ready",
      "keyword": "ready",
      "location": "ready"
    }
  }
}
```

**Example Request:**
```bash
curl http://localhost:3000/api/status
```

**Implementation:**
```javascript
router.get('/status', async (req, res) => {
    try {
        const used = process.memoryUsage();

        res.json({
            success: true,
            data: {
                status: "running",
                uptime: process.uptime(),
                version: "2.0",
                database: {
                    connected: mongoose.connection.readyState === 1,
                    type: config.useMemoryServer ? "MongoDB Memory Server" : "MongoDB"
                },
                memory: {
                    used: (used.heapUsed / 1024 / 1024).toFixed(2),
                    total: (used.heapTotal / 1024 / 1024).toFixed(2),
                    unit: "MB"
                },
                collections: {
                    rest: "ready",
                    stream: "ready",
                    keyword: "ready",
                    location: "ready"
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

---

#### 11. Clear Collection

**Endpoint:** `DELETE /api/admin/clear/:collection`

**Description:** Clears all documents from specified collection. **Use with caution!**

**Parameters:**
- `:collection` (required): Collection name (rest, stream, keyword, location, or all)

**Response:**
```json
{
  "success": true,
  "data": {
    "collection": "rest",
    "deletedCount": 150
  }
}
```

**Example Request:**
```bash
curl -X DELETE http://localhost:3000/api/admin/clear/rest
```

**Implementation:**
```javascript
router.delete('/clear/:collection', async (req, res) => {
    try {
        const collection = req.params.collection;
        let deletedCount = 0;

        if (collection === 'rest' || collection === 'all') {
            const result = await TweetsDB.tweetsREST.deleteMany({}).exec();
            deletedCount += result.deletedCount;
        }
        // ... similar for other collections

        res.json({
            success: true,
            data: {
                collection: collection,
                deletedCount: deletedCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});
```

---

## Data Models

### Tweet Schema

```javascript
// Mongoose Schema Definition
const tweetSchema = new mongoose.Schema({
    // Tweet identifiers
    id_str: {
        type: String,
        required: true,
        unique: true,
        index: true
    },

    // Tweet content
    text: {
        type: String,
        required: true,
        maxlength: 280
    },

    // Timestamp
    created_at: {
        type: Date,
        required: true
    },

    // User information
    user: {
        id_str: String,
        screen_name: String,
        name: String,
        followers_count: Number,
        friends_count: Number,
        verified: Boolean,
        geo_enabled: Boolean
    },

    // Geographic data
    place: {
        type: {
            name: String,
            full_name: String,
            country: String,
            country_code: String,
            place_type: String,
            bounding_box: {
                coordinates: [[[ Number ]]]
            }
        },
        default: null
    },

    coordinates: {
        type: {
            type: String,
            coordinates: [Number]
        },
        default: null
    },

    // Engagement metrics
    retweet_count: {
        type: Number,
        default: 0
    },

    favorite_count: {
        type: Number,
        default: 0
    },

    // Tweet type flags
    is_quote_status: {
        type: Boolean,
        default: false
    },

    retweeted: {
        type: Boolean,
        default: false
    },

    // Entities (hashtags, mentions, URLs)
    entities: {
        hashtags: [{
            text: String,
            indices: [Number]
        }],
        user_mentions: [{
            screen_name: String,
            name: String,
            id_str: String,
            indices: [Number]
        }],
        urls: [{
            url: String,
            expanded_url: String,
            display_url: String,
            indices: [Number]
        }]
    },

    // Language
    lang: {
        type: String,
        default: 'en'
    }
}, {
    timestamps: true  // Adds createdAt and updatedAt
});
```

### Tweet Object Example

```json
{
  "_id": "507f1f77bcf86cd799439011",
  "id_str": "1234567890123456789",
  "text": "Beautiful day in Glasgow! #Scotland #Weather",
  "created_at": "2025-11-03T12:34:56.000Z",
  "user": {
    "id_str": "987654321",
    "screen_name": "johndoe",
    "name": "John Doe",
    "followers_count": 1523,
    "friends_count": 345,
    "verified": false,
    "geo_enabled": true
  },
  "place": {
    "name": "Glasgow",
    "full_name": "Glasgow, Scotland",
    "country": "United Kingdom",
    "country_code": "GB",
    "place_type": "city"
  },
  "coordinates": {
    "type": "Point",
    "coordinates": [-4.251806, 55.864237]
  },
  "retweet_count": 5,
  "favorite_count": 23,
  "is_quote_status": false,
  "retweeted": false,
  "entities": {
    "hashtags": [
      { "text": "Scotland", "indices": [34, 43] },
      { "text": "Weather", "indices": [44, 52] }
    ],
    "user_mentions": [],
    "urls": []
  },
  "lang": "en",
  "createdAt": "2025-11-03T12:34:56.789Z",
  "updatedAt": "2025-11-03T12:34:56.789Z"
}
```

---

## Error Handling

### Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": {}
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `DATABASE_ERROR` | 500 | Database operation failed |
| `TWITTER_API_ERROR` | 503 | Twitter API is unavailable |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

### Example Error Responses

**Missing Required Parameter:**
```json
{
  "success": false,
  "error": {
    "message": "Query parameter 'q' is required",
    "code": "VALIDATION_ERROR"
  }
}
```

**Resource Not Found:**
```json
{
  "success": false,
  "error": {
    "message": "Tweet with id '123' not found",
    "code": "NOT_FOUND"
  }
}
```

**Database Error:**
```json
{
  "success": false,
  "error": {
    "message": "Failed to connect to database",
    "code": "DATABASE_ERROR",
    "details": {
      "reason": "Connection timeout"
    }
  }
}
```

---

## Rate Limiting

### Current Implementation

**Status:** Not currently implemented

### Recommended Implementation

```javascript
const rateLimit = require('express-rate-limit');

// Create limiter
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        error: {
            message: 'Too many requests, please try again later',
            code: 'RATE_LIMIT_EXCEEDED'
        }
    }
});

// Apply to all API routes
app.use('/api/', apiLimiter);
```

### Twitter API Rate Limits

When collecting data from Twitter, be aware of these limits:

**REST API:**
- 180 requests per 15 minutes per endpoint
- 900 requests per 15 minutes for /search/tweets (authenticated)

**Streaming API:**
- Connection limits vary by endpoint
- 1% sample stream for free tier
- Filtered streams: 400 keywords max

---

## Examples

### Complete Usage Examples

#### Example 1: Get All Statistics

```javascript
const axios = require('axios');

async function getStatistics() {
    try {
        const response = await axios.get('http://localhost:3000/api/analytics/stats');
        console.log('Statistics:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error:', error.message);
    }
}

getStatistics();
```

#### Example 2: Search and Process Tweets

```javascript
async function searchAndProcess(query) {
    try {
        // Search for tweets
        const response = await axios.get('http://localhost:3000/api/tweets/search', {
            params: {
                q: query,
                limit: 100
            }
        });

        const tweets = response.data.data.results;
        console.log(`Found ${tweets.length} tweets`);

        // Process tweets
        const hashtags = {};
        tweets.forEach(tweet => {
            if (tweet.entities && tweet.entities.hashtags) {
                tweet.entities.hashtags.forEach(tag => {
                    hashtags[tag.text] = (hashtags[tag.text] || 0) + 1;
                });
            }
        });

        console.log('Top hashtags:', hashtags);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

searchAndProcess('Glasgow');
```

#### Example 3: Pagination Through Large Dataset

```javascript
async function getAllTweets(collection) {
    const limit = 100;
    let skip = 0;
    let allTweets = [];
    let hasMore = true;

    while (hasMore) {
        try {
            const response = await axios.get(`http://localhost:3000/api/tweets/${collection}`, {
                params: { limit, skip }
            });

            const tweets = response.data.data.tweets;
            allTweets = allTweets.concat(tweets);

            hasMore = response.data.pagination.hasMore;
            skip += limit;

            console.log(`Retrieved ${allTweets.length} tweets so far...`);
        } catch (error) {
            console.error('Error:', error.message);
            break;
        }
    }

    console.log(`Total tweets retrieved: ${allTweets.length}`);
    return allTweets;
}

getAllTweets('stream/nofilter');
```

#### Example 4: Monitor Server Health

```javascript
async function monitorHealth() {
    setInterval(async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/status');
            const status = response.data.data;

            console.log(`Status: ${status.status}`);
            console.log(`Uptime: ${Math.floor(status.uptime / 60)} minutes`);
            console.log(`Memory: ${status.memory.used}/${status.memory.total} MB`);
            console.log(`Database: ${status.database.connected ? 'Connected' : 'Disconnected'}`);
            console.log('---');
        } catch (error) {
            console.error('Health check failed:', error.message);
        }
    }, 60000); // Check every minute
}

monitorHealth();
```

#### Example 5: Python Client

```python
import requests
import json

class TwitterCrawlerClient:
    def __init__(self, base_url='http://localhost:3000'):
        self.base_url = base_url

    def get_stats(self):
        """Get analytics statistics"""
        response = requests.get(f'{self.base_url}/api/analytics/stats')
        return response.json()

    def search_tweets(self, query, limit=50):
        """Search for tweets"""
        params = {'q': query, 'limit': limit}
        response = requests.get(f'{self.base_url}/api/tweets/search', params=params)
        return response.json()

    def get_tweets(self, collection, limit=100, skip=0):
        """Get tweets from specific collection"""
        params = {'limit': limit, 'skip': skip}
        response = requests.get(f'{self.base_url}/api/tweets/{collection}', params=params)
        return response.json()

# Usage
client = TwitterCrawlerClient()

# Get statistics
stats = client.get_stats()
print(f"Total tweets: {stats['data']['totals']['allTweets']}")

# Search tweets
results = client.search_tweets('Glasgow', limit=10)
print(f"Found {results['data']['count']} tweets")

# Get stream tweets
tweets = client.get_tweets('stream/nofilter', limit=50)
print(f"Retrieved {tweets['data']['count']} tweets")
```

---

## WebSocket API (Future Enhancement)

### Real-time Tweet Streaming

**Endpoint:** `ws://localhost:3000/ws/tweets`

**Description:** WebSocket connection for real-time tweet updates.

**Example Client:**
```javascript
const WebSocket = require('ws');

const ws = new WebSocket('ws://localhost:3000/ws/tweets');

ws.on('open', () => {
    console.log('Connected to tweet stream');

    // Subscribe to specific collection
    ws.send(JSON.stringify({
        action: 'subscribe',
        collection: 'stream'
    }));
});

ws.on('message', (data) => {
    const tweet = JSON.parse(data);
    console.log('New tweet:', tweet.text);
});

ws.on('close', () => {
    console.log('Disconnected from stream');
});
```

---

## Appendix

### HTTP Methods Summary

| Method | Use Case |
|--------|----------|
| GET | Retrieve resources |
| POST | Create new resources |
| PUT | Update entire resource |
| PATCH | Update partial resource |
| DELETE | Remove resource |

### Content-Type Headers

All requests and responses use:
```
Content-Type: application/json
```

### CORS Configuration

The server allows all origins by default:
```javascript
app.use(cors());
```

For production, restrict to specific origins:
```javascript
app.use(cors({
    origin: 'https://your-frontend-domain.com'
}));
```

---

**End of API Documentation**
**Version 2.0 | November 2025**
