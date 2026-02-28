# Twitter Web Science Crawler - Technical Specifications

**Version:** 2.0
**Last Updated:** November 3, 2025
**Document Type:** Technical Reference

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Database Design](#database-design)
4. [Algorithms & Data Structures](#algorithms--data-structures)
5. [Performance Specifications](#performance-specifications)
6. [Security Specifications](#security-specifications)
7. [Scalability Considerations](#scalability-considerations)
8. [Testing Strategy](#testing-strategy)

---

## System Architecture

### High-Level Architecture

```
┌────────────────────────────────────────────────────────────┐
│                   CLIENT TIER                               │
│                                                             │
│  ┌──────────────┐         ┌──────────────┐               │
│  │  Web Browser │         │ API Clients  │               │
│  │  (Angular 18)│         │ (REST/HTTP)  │               │
│  └──────┬───────┘         └──────┬───────┘               │
└─────────┼────────────────────────┼────────────────────────┘
          │                        │
          │ HTTP/HTTPS             │ HTTP/HTTPS (JSON)
          │                        │
┌─────────┼────────────────────────┼────────────────────────┐
│         │    APPLICATION TIER    │                        │
│         │                        │                        │
│  ┌──────▼────────────────────────▼───────┐               │
│  │      Express.js Application           │               │
│  │                                        │               │
│  │  ┌────────────────────────────────┐  │               │
│  │  │     Middleware Layer           │  │               │
│  │  │  • Body Parser (JSON/URL)      │  │               │
│  │  │  • CORS Handler                │  │               │
│  │  │  • Logger (Winston)            │  │               │
│  │  │  • Error Handler               │  │               │
│  │  └────────────────────────────────┘  │               │
│  │                                        │               │
│  │  ┌────────────────────────────────┐  │               │
│  │  │     Application Layer          │  │               │
│  │  │  ┌──────────────────────────┐  │  │               │
│  │  │  │   Controllers            │  │  │               │
│  │  │  │  • Analytics Controller  │  │  │               │
│  │  │  │  • Clustering Controller │  │  │               │
│  │  │  │  • Twitter API Controller│  │  │               │
│  │  │  └──────────────────────────┘  │  │               │
│  │  │                                 │  │               │
│  │  │  ┌──────────────────────────┐  │  │               │
│  │  │  │   Services               │  │  │               │
│  │  │  │  • Tweet Collection      │  │  │               │
│  │  │  │  • Data Processing       │  │  │               │
│  │  │  │  • Analytics Engine      │  │  │               │
│  │  │  │  • Clustering Engine     │  │  │               │
│  │  │  └──────────────────────────┘  │  │               │
│  │  │                                 │  │               │
│  │  │  ┌──────────────────────────┐  │  │               │
│  │  │  │   Models (Mongoose ODM)  │  │  │               │
│  │  │  │  • Tweet Schemas         │  │  │               │
│  │  │  │  • Validation Rules      │  │  │               │
│  │  │  └──────────────────────────┘  │  │               │
│  │  └────────────────────────────────┘  │               │
│  └────────────────────────────────────────┘               │
└─────────┼────────────────────────┼────────────────────────┘
          │                        │
          │ Mongoose ODM           │ HTTP API Calls
          │                        │
┌─────────▼────────────────────────▼────────────────────────┐
│                   DATA TIER                                │
│                                                            │
│  ┌──────────────────────────────────────────────────┐    │
│  │         MongoDB Database                          │    │
│  │  (In-Memory or Disk-Based)                       │    │
│  │                                                   │    │
│  │  Collections:                                     │    │
│  │  • tweetsREST                                     │    │
│  │  • tweetsSTREAMNoFilter                          │    │
│  │  • tweetsSTREAMKeywordFilter                     │    │
│  │  • tweetsSTREAMLocationFilter                    │    │
│  │                                                   │    │
│  │  Indexes:                                         │    │
│  │  • id_str (unique, text search)                  │    │
│  │  • created_at (time-series queries)              │    │
│  │  • place.country_code (geo queries)              │    │
│  │  • user.screen_name (user queries)               │    │
│  └──────────────────────────────────────────────────┘    │
└───────────────────────────────┬────────────────────────────┘
                                │
                                │
┌───────────────────────────────▼────────────────────────────┐
│              EXTERNAL SERVICES TIER                         │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ Twitter      │  │ Plotly       │  │ MongoDB      │   │
│  │ REST API     │  │ Graphing     │  │ Memory       │   │
│  │ v1.1         │  │ Service      │  │ Server       │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### Component Interaction Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    REQUEST FLOW                              │
└─────────────────────────────────────────────────────────────┘

1. Client Request
   ↓
2. Express.js Router
   ↓
3. Middleware Pipeline
   ├─ Body Parser → Parse JSON/URL encoded data
   ├─ CORS → Handle cross-origin requests
   └─ Logger → Log incoming request
   ↓
4. Route Handler
   ↓
5. Controller
   ├─ Validate Input
   ├─ Call Service Layer
   └─ Format Response
   ↓
6. Service Layer
   ├─ Business Logic
   ├─ Data Processing
   └─ External API Calls
   ↓
7. Data Access Layer (Mongoose)
   ├─ Query Building
   ├─ Validation
   └─ Execution
   ↓
8. MongoDB
   ├─ Query Execution
   ├─ Index Lookup
   └─ Result Retrieval
   ↓
9. Response
   ├─ Format JSON
   ├─ Add Metadata
   └─ Send to Client
```

### Data Collection Flow

```
┌────────────────────────────────────────────────────┐
│          TWITTER DATA COLLECTION FLOW              │
└────────────────────────────────────────────────────┘

Twitter API
    │
    ├─── REST API ───┐
    │                │
    ├─── Sample Stream ──┐
    │                    │
    ├─── Keyword Stream ─┼─── Twit Client (Node.js)
    │                    │
    └─── Location Stream ┘
         │
         ↓
    JSON Response
         │
         ↓
    Tweet Validator
         │
         ├─── Valid ────→ Schema Mapper
         │                     │
         └─── Invalid ──→ Error Logger
                               │
                               ↓
                        Mongoose Model
                               │
                               ↓
                        MongoDB Collection
                        (Based on Source)
                               │
                               ├─── REST → tweetsREST
                               ├─── Sample → tweetsSTREAMNoFilter
                               ├─── Keyword → tweetsSTREAMKeywordFilter
                               └─── Location → tweetsSTREAMLocationFilter
                               │
                               ↓
                        Success/Error Logger
```

---

## Technology Stack

### Backend Technologies

#### Node.js Runtime
- **Version:** 14+ (Recommended: 18 LTS or 20 LTS)
- **Role:** JavaScript runtime environment
- **Reason for Choice:**
  - Asynchronous I/O perfect for network requests
  - Large ecosystem (npm)
  - Single language for full-stack (JavaScript)
  - Excellent Twitter API library support

#### Express.js Framework
- **Version:** 4.21.2
- **Role:** Web application framework
- **Key Features Used:**
  - Routing
  - Middleware pipeline
  - JSON body parsing (built-in)
  - Static file serving
- **Performance Characteristics:**
  - ~15,000 requests/second (simple routes)
  - Minimal overhead (~5ms per request)

#### Mongoose ODM
- **Version:** 8.9.3
- **Role:** MongoDB Object Document Mapper
- **Key Features:**
  - Schema definition
  - Validation
  - Query building
  - Middleware hooks
  - Population (joins)
- **Breaking Changes in v8:**
  - No callback support (Promises only)
  - Stricter types
  - Better async/await integration

#### Winston Logger
- **Version:** 3.18.3
- **Role:** Logging framework
- **Configuration:**
  ```javascript
  {
    level: 'verbose',
    format: combine(
      timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
      new Console(),
      new DailyRotateFile({
        filename: 'logs/%DATE%.log',
        datePattern: 'DD-MM-YYYY'
      })
    ]
  }
  ```
- **Log Levels:**
  - error: 0 (highest priority)
  - warn: 1
  - info: 2
  - verbose: 3
  - debug: 4 (lowest priority)

### Frontend Technologies

#### Angular Framework
- **Version:** 18.2.13
- **Role:** Frontend SPA framework
- **Architecture Pattern:** Component-based
- **Key Features:**
  - Two-way data binding
  - Dependency injection
  - Reactive programming (RxJS)
  - CLI tooling
- **Build System:** esbuild (Angular 18+)
  - Faster than Webpack
  - Tree-shaking optimization
  - Module federation support

#### TypeScript
- **Version:** 5.5.4
- **Role:** Type-safe JavaScript superset
- **Configuration:**
  ```json
  {
    "target": "ES2022",
    "module": "ES2022",
    "moduleResolution": "bundler",
    "strict": false,
    "experimentalDecorators": true
  }
  ```
- **Benefits:**
  - Compile-time type checking
  - Better IDE support
  - Self-documenting code

#### RxJS
- **Version:** 7.8.1
- **Role:** Reactive programming library
- **Key Operators Used:**
  - `map`: Transform data
  - `filter`: Filter streams
  - `switchMap`: Switch to new observable
  - `catchError`: Error handling
  - `retry`: Retry failed requests

### Database Technologies

#### MongoDB
- **Version:** 5.0+ (or MongoDB Memory Server 10.1.2)
- **Type:** NoSQL Document Database
- **Reason for Choice:**
  - Flexible schema (JSON documents)
  - Horizontal scalability
  - Good for semi-structured data (tweets)
  - Rich query language
  - Excellent Node.js support

**Storage Engine:** WiredTiger
- **Features:**
  - Document-level concurrency
  - Compression
  - Journaling for durability

**Index Types Used:**
```javascript
// Unique index on tweet ID
{ id_str: 1 }  // Ascending

// Compound index for geo queries
{ 'place.country_code': 1, created_at: -1 }

// Text index for search
{ text: 'text', 'user.screen_name': 'text' }
```

#### MongoDB Memory Server
- **Version:** 10.1.2
- **Role:** In-memory MongoDB for testing
- **Memory Usage:** ~100-200 MB
- **Startup Time:** ~2-3 seconds
- **Perfect For:**
  - Development
  - Testing
  - CI/CD pipelines
  - No local MongoDB installation needed

### External APIs

#### Twitter API v1.1
- **Library:** Twit 2.2.11
- **Endpoints Used:**
  - `GET search/tweets` (REST)
  - `POST statuses/filter` (Streaming)
  - `GET statuses/sample` (Streaming)
- **Rate Limits:**
  - REST: 180 requests/15 min
  - Streaming: Connection-based limits

#### Plotly API
- **Library:** plotly 1.0.6
- **Role:** Graph generation and hosting
- **Usage:**
  - Create bar charts
  - Upload to Plotly cloud
  - Return shareable URLs

### Development Tools

#### npm (Node Package Manager)
- **Version:** 9+
- **Lock File:** package-lock.json
- **Scripts:**
  ```json
  {
    "start": "node app.js",
    "test": "jest",
    "dev": "nodemon app.js"
  }
  ```

#### Angular CLI
- **Version:** 18.2.12
- **Commands:**
  - `ng serve`: Development server
  - `ng build`: Production build
  - `ng test`: Run tests

---

## Database Design

### Schema Design Philosophy

**Document-Oriented Design:**
- Each tweet is a self-contained document
- No foreign keys or joins needed
- Denormalized for read performance
- Trade-off: Some data duplication

### Collection Structures

#### 1. tweetsREST Collection

**Purpose:** Store tweets from REST API searches

**Schema:**
```javascript
{
  _id: ObjectId,                    // MongoDB auto-generated ID
  id_str: String,                   // Twitter's tweet ID (unique)
  text: String,                     // Tweet content (max 280 chars)
  created_at: Date,                 // Tweet timestamp
  user: {                           // Embedded user document
    id_str: String,
    screen_name: String,
    name: String,
    followers_count: Number,
    friends_count: Number,
    verified: Boolean,
    geo_enabled: Boolean
  },
  place: {                          // Embedded place document (nullable)
    name: String,
    full_name: String,
    country: String,
    country_code: String,
    place_type: String,
    bounding_box: {
      coordinates: [[[Number]]]
    }
  },
  coordinates: {                    // Precise coordinates (nullable)
    type: String,                   // "Point"
    coordinates: [Number, Number]   // [longitude, latitude]
  },
  retweet_count: Number,
  favorite_count: Number,
  is_quote_status: Boolean,
  retweeted: Boolean,
  entities: {                       // Embedded entities
    hashtags: [{
      text: String,
      indices: [Number, Number]
    }],
    user_mentions: [{
      screen_name: String,
      name: String,
      id_str: String,
      indices: [Number, Number]
    }],
    urls: [{
      url: String,
      expanded_url: String,
      display_url: String,
      indices: [Number, Number]
    }]
  },
  lang: String,                     // Language code (en, es, etc.)
  createdAt: Date,                  // Mongoose timestamp
  updatedAt: Date                   // Mongoose timestamp
}
```

**Indexes:**
```javascript
// Primary key
{ id_str: 1 } // Unique

// Time-series queries
{ created_at: -1 }

// Geographic queries
{ 'place.country_code': 1, 'place.name': 1 }

// User queries
{ 'user.screen_name': 1 }

// Text search
{ text: 'text', 'user.screen_name': 'text' }
```

**Storage Estimation:**
- Average document size: ~2-3 KB
- 10,000 tweets: ~25 MB
- 100,000 tweets: ~250 MB
- 1,000,000 tweets: ~2.5 GB

#### 2-4. Stream Collections

Same schema as tweetsREST, replicated across:
- `tweetsSTREAMNoFilter`
- `tweetsSTREAMKeywordFilter`
- `tweetsSTREAMLocationFilter`

**Reason for Separation:**
- Easier to analyze by collection method
- Better performance (smaller collections)
- Simpler to manage/delete data
- Allows comparison between methods

### Query Patterns

#### Most Common Queries

**1. Count Documents:**
```javascript
// Fast - uses count operation
TweetsDB.tweetsREST.countDocuments().exec();

// Time complexity: O(1) with index
// Typical execution: <10ms
```

**2. Find with Conditions:**
```javascript
// Find geo-tagged tweets
TweetsDB.tweetsREST.find({
  place: { $ne: null }
}).exec();

// Time complexity: O(n) without index, O(log n) with index
// Typical execution: 50-500ms depending on dataset size
```

**3. Find Specific Tweet:**
```javascript
// Find by ID (indexed)
TweetsDB.tweetsREST.findOne({
  id_str: '1234567890'
}).exec();

// Time complexity: O(1) with unique index
// Typical execution: <5ms
```

**4. Aggregate Pipeline:**
```javascript
// Group by country
TweetsDB.tweetsREST.aggregate([
  { $match: { 'place': { $ne: null } } },
  { $group: {
      _id: '$place.country_code',
      count: { $sum: 1 }
    }
  },
  { $sort: { count: -1 } }
]).exec();

// Time complexity: O(n log n) due to grouping and sorting
// Typical execution: 100-1000ms
```

### Database Performance Tuning

#### Index Strategy

**Compound Indexes:**
```javascript
// For queries filtering by place AND sorting by date
db.tweets.createIndex({
  'place.country_code': 1,
  created_at: -1
});

// Query that uses this index efficiently:
db.tweets.find({
  'place.country_code': 'GB'
}).sort({ created_at: -1 });
```

**Index Selectivity:**
- High selectivity (good): `id_str` (unique)
- Medium selectivity: `place.country_code` (~200 values)
- Low selectivity (poor): `lang` (~50 values)

**Index Memory Usage:**
```
Index size ≈ (key size × number of documents) / compression ratio

Example for id_str index on 100,000 tweets:
= (20 bytes × 100,000) / 3
= ~667 KB
```

#### Query Optimization

**Use `.lean()`for Read-Only:**
```javascript
// Without lean (full Mongoose document)
const tweets = await TweetsDB.tweetsREST.find({}).exec();
// ~50ms, returns Mongoose documents with methods

// With lean (plain JavaScript objects)
const tweets = await TweetsDB.tweetsREST.find({}).lean().exec();
// ~30ms, returns plain objects (40% faster)
```

**Use `.select()` to Limit Fields:**
```javascript
// Fetching all fields
const tweets = await TweetsDB.tweetsREST.find({}).exec();
// Returns ~3KB per document

// Fetching only needed fields
const tweets = await TweetsDB.tweetsREST
  .find({})
  .select('text user.screen_name created_at')
  .exec();
// Returns ~0.5KB per document (6x smaller)
```

**Use `.limit()` for Large Results:**
```javascript
// Without limit (could return millions)
const tweets = await TweetsDB.tweetsREST.find({}).exec();
// Slow, high memory usage

// With limit
const tweets = await TweetsDB.tweetsREST.find({}).limit(100).exec();
// Fast, controlled memory usage
```

---

## Algorithms & Data Structures

### MinHash LSH Clustering Algorithm

#### Overview

**Purpose:** Group similar tweets together efficiently

**Algorithm:** Locality-Sensitive Hashing with MinHash signatures

**Time Complexity:**
- Signature generation: O(n × k) where n = tweets, k = hash functions
- Index building: O(n × b) where b = bands
- Querying: O(n/b) average case (much better than O(n²) brute force)

#### Detailed Implementation

**Step 1: Text Preprocessing**

```javascript
// Input: Tweet text
// Output: Cleaned word array

function preprocessTweet(text) {
  // 1. Remove emojis (regex pattern)
  const regex = /[\u{1F600}-\u{1F64F}...]/gu;
  const cleanText = text.replace(regex, '');

  // 2. Split into words
  const words = cleanText.split(/\s+/);

  // 3. Remove stopwords (20+ languages)
  const stopwordsList = [...eng, ...spa, ...fra, ...deu, ...ita, ...];
  const filtered = removeStopwords(words, stopwordsList);

  // 4. Convert to lowercase
  const normalized = filtered.map(w => w.toLowerCase());

  return normalized;
}

// Example:
// Input: "Beautiful day in Glasgow! 🌞 #Scotland"
// Output: ["beautiful", "day", "glasgow", "scotland"]
```

**Step 2: MinHash Signature Generation**

```javascript
// MinHash: Estimate Jaccard similarity between sets

function generateMinHash(words, numHashes = 100) {
  const minhash = new Minhash();

  // Update with each word
  words.forEach(word => {
    minhash.update(word);
  });

  // Returns array of 100 hash values
  return minhash.signature;
}

// Mathematical principle:
// P(hash1 == hash2) = Jaccard_similarity(set1, set2)
//
// Jaccard similarity:
// J(A,B) = |A ∩ B| / |A ∪ B|
//
// Example:
// Tweet A: ["glasgow", "weather", "rain"]
// Tweet B: ["glasgow", "weather", "sunny"]
// J(A,B) = |{glasgow, weather}| / |{glasgow, weather, rain, sunny}|
//        = 2 / 4 = 0.5 (50% similar)
```

**Step 3: LSH Index Building**

```javascript
// LSH: Organize signatures into bands for fast lookup

function buildLSHIndex(signatures, bands = 20) {
  const index = new LshIndex();

  signatures.forEach((sig, id) => {
    // Insert signature with ID
    index.insert(id, sig);
  });

  // Internally, LSH divides signature into bands:
  // If signature has 100 values and 20 bands:
  // Each band has 100/20 = 5 values
  //
  // Tweets hashing to same band values are candidates for similarity

  return index;
}

// Probability of being in same bucket:
// P = 1 - (1 - s^r)^b
// where:
//   s = Jaccard similarity
//   r = rows per band (100/20 = 5)
//   b = number of bands (20)
//
// This creates S-curve:
// - Very similar tweets (s > 0.7): ~99% chance of matching
// - Dissimilar tweets (s < 0.3): ~1% chance of matching
```

**Step 4: Cluster Formation**

```javascript
// Query index for each tweet to find similar tweets

function formClusters(index, signatures) {
  const clusters = [];
  const processed = new Set();

  signatures.forEach((sig, id) => {
    if (processed.has(id)) return;

    // Find similar tweets
    const similar = index.query(sig);

    if (similar.length > 1) {
      // Create cluster
      clusters.push(similar);
      similar.forEach(s => processed.add(s));
    }
  });

  return clusters;
}

// Example output:
// [
//   ["tweet1", "tweet5", "tweet23"],  // Cluster about weather
//   ["tweet2", "tweet7"],              // Cluster about traffic
//   ["tweet3", "tweet9", "tweet11", "tweet18"]  // Cluster about event
// ]
```

#### Performance Characteristics

**Memory Usage:**
```
Per tweet:
- MinHash signature: 100 hashes × 4 bytes = 400 bytes
- LSH index entry: ~200 bytes
Total: ~600 bytes per tweet

For 100,000 tweets: ~60 MB
```

**Time Complexity:**
```
Preprocessing: O(n × m) where m = avg words per tweet (~10-20)
Signature generation: O(n × 100)
Index building: O(n × 20)
Querying: O(n × log(n/20)) ≈ O(n × log n)

Total: O(n × log n)

For 100,000 tweets:
- Preprocessing: ~5 seconds
- Signature gen: ~10 seconds
- Index building: ~2 seconds
- Querying: ~15 seconds
Total: ~32 seconds
```

### Stopword Removal Algorithm

#### Implementation

```javascript
// Multi-language stopword removal

function removeAllStopwords(words) {
  // Combine stopwords from all languages
  const allStopwords = [
    ...eng,  // English: the, is, are, was...
    ...spa,  // Spanish: el, la, de, en...
    ...fra,  // French: le, la, de, un...
    ...deu,  // German: der, die, das, und...
    ...ita,  // Italian: il, la, di, e...
    ...por,  // Portuguese: o, a, de, em...
    ...rus,  // Russian: и, в, не, на...
    ...jpn,  // Japanese: の, に, は, を...
    ...zho,  // Chinese: 的, 了, 在, 是...
    // ... 20+ languages total
  ];

  // Create Set for O(1) lookup
  const stopwordSet = new Set(allStopwords);

  // Filter out stopwords
  return words.filter(word => !stopwordSet.has(word.toLowerCase()));
}

// Time complexity: O(n) where n = number of words
// Space complexity: O(s) where s = total stopwords (~5,000)

// Example:
// Input: ["the", "weather", "in", "glasgow", "is", "great"]
// Output: ["weather", "glasgow", "great"]
```

#### Stopword Statistics

**Total Stopwords by Language:**
```
English: ~174 words
Spanish: ~183 words
French: ~186 words
German: ~231 words
Italian: ~279 words
Portuguese: ~203 words
Russian: ~157 words
Japanese: ~45 words
Chinese: ~108 words
Arabic: ~166 words
...
Total: ~5,000 words across 20+ languages
```

### Analytics Algorithms

#### Duplicate Detection

```javascript
// Find tweets appearing in multiple collections

async function findDuplicates() {
  const seen = new Map();
  const duplicates = [];

  // Iterate through all collections
  for (const collection of allCollections) {
    const tweets = await collection.find({}).select('id_str').lean().exec();

    tweets.forEach(tweet => {
      if (seen.has(tweet.id_str)) {
        // Duplicate found
        const original = seen.get(tweet.id_str);
        duplicates.push({
          id: tweet.id_str,
          collections: [original, collection.name]
        });
      } else {
        seen.set(tweet.id_str, collection.name);
      }
    });
  }

  return duplicates;
}

// Time complexity: O(n) where n = total tweets across all collections
// Space complexity: O(u) where u = unique tweets

// For 100,000 tweets with 10% duplication:
// - Time: ~2 seconds
// - Memory: ~90,000 entries × 40 bytes = ~3.6 MB
```

#### Retweet Detection

```javascript
// Count retweets (tweets starting with "RT")

async function countRetweets() {
  let count = 0;

  const allTweets = await getAllTweetsFromAllCollections();

  allTweets.forEach(tweet => {
    // Twitter retweets start with "RT @username:"
    if (tweet.text && tweet.text.substring(0, 2) === "RT") {
      count++;
    }
  });

  return count;
}

// Alternative using regex:
const retweetPattern = /^RT @\w+:/;
const isRetweet = retweetPattern.test(tweet.text);

// Time complexity: O(n)
// Typical ratio: 40-50% of tweets are retweets
```

---

## Performance Specifications

### Response Time Requirements

| Operation | Target | Acceptable | Poor |
|-----------|---------|------------|------|
| Simple query (by ID) | <10ms | <50ms | >100ms |
| Collection count | <20ms | <100ms | >200ms |
| Search (100 results) | <100ms | <500ms | >1s |
| Analytics (full) | <5s | <15s | >30s |
| Clustering (10K tweets) | <30s | <120s | >300s |
| API response (cached) | <50ms | <200ms | >500ms |

### Throughput Specifications

**Backend Server:**
- **Concurrent requests:** 100+ (with clustering)
- **Requests/second:** 500+ (simple routes)
- **Database queries/second:** 1,000+ (with indexes)

**Twitter API Collection:**
- **REST API:** 180 requests/15 min = 12/min
- **Streaming:** Continuous, ~10-50 tweets/second
- **Storage rate:** ~1-3 MB/minute (streaming)

### Memory Usage

**Backend Process:**
```
Baseline (empty database): ~50 MB
With 10,000 tweets loaded: ~150 MB
During clustering (100K tweets): ~500 MB
With MongoDB Memory Server: +100-200 MB

Recommended minimum: 512 MB RAM
Recommended for production: 2 GB RAM
```

**Frontend Build:**
```
Development build: ~135 MB (uncompressed)
Production build: ~135 KB (41 KB gzipped)
Runtime memory: ~20-50 MB in browser
```

### Disk Usage

**Logs:**
```
Per day: ~10-50 MB (depends on activity)
Rotation: Daily
Retention: Recommend 30 days
Total: ~300-1500 MB for logs
```

**Database:**
```
Empty: ~100 MB (MongoDB overhead)
10,000 tweets: ~125 MB
100,000 tweets: ~350 MB
1,000,000 tweets: ~3.5 GB

With indexes (add 10-20%):
1,000,000 tweets: ~4.2 GB total
```

### Network Bandwidth

**Twitter API:**
```
REST API response: ~5-10 KB per tweet
Streaming: ~50-500 KB/second (depends on filter)
Daily streaming: ~4-40 GB/day
```

**API Server:**
```
Request overhead: ~500 bytes
Response (100 tweets): ~300-500 KB
With pagination: Controlled by limit parameter
```

### Scalability Limits

**Current Architecture:**
```
Single server capacity:
- Tweets stored: ~10 million (reasonable performance)
- Concurrent users: ~100-200
- Tweets/second processing: ~50

Bottlenecks:
1. MongoDB single instance
2. Clustering algorithm (O(n log n))
3. Single-threaded Node.js (for CPU-intensive tasks)
```

**Recommended Scaling Thresholds:**
```
If tweets > 10 million:
  → Implement sharding or use MongoDB Atlas

If concurrent users > 200:
  → Add load balancer and multiple backend instances

If clustering takes > 5 minutes:
  → Move to background job queue (Bull, Agenda)
  → Consider distributed computing (Spark)
```

---

## Security Specifications

### Current Security Posture

⚠️ **Warning:** Current implementation is for research/development. Production deployment requires additional security measures.

**Current Status:**
- ✅ Twitter API keys stored in file (should use environment variables)
- ❌ No API authentication
- ❌ No rate limiting
- ❌ No input sanitization
- ❌ No HTTPS enforcement
- ⚠️ CORS allows all origins

### Recommended Security Enhancements

#### 1. Authentication & Authorization

**Implement JWT Authentication:**
```javascript
const jwt = require('jsonwebtoken');

// Generate token
function generateToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
}

// Verify middleware
function authenticateToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}
```

#### 2. Input Validation & Sanitization

**Use Express Validator:**
```javascript
const { body, query, validationResult } = require('express-validator');

// Validate search query
router.get('/search',
  query('q')
    .trim()
    .escape()
    .isLength({ min: 1, max: 100 })
    .withMessage('Query must be 1-100 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 1000 })
    .toInt(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request...
  }
);
```

#### 3. Rate Limiting

**Implementation:**
```javascript
const rateLimit = require('express-rate-limit');

// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later'
});

// Strict limiter for expensive operations
const clusteringLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 requests per hour
  message: 'Clustering is resource-intensive, please wait before trying again'
});

app.use('/api/', apiLimiter);
app.use('/api/clustering/', clusteringLimiter);
```

#### 4. Environment Variables

**Use dotenv:**
```javascript
// .env file
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb://localhost:27017/twitterData
JWT_SECRET=your-secret-key-here
TWITTER_CONSUMER_KEY=...
TWITTER_CONSUMER_SECRET=...
TWITTER_ACCESS_TOKEN=...
TWITTER_ACCESS_SECRET=...

// Load in app.js
require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET
};
```

#### 5. HTTPS/TLS

**Production Configuration:**
```javascript
const https = require('https');
const fs = require('fs');

const options = {
  key: fs.readFileSync('privkey.pem'),
  cert: fs.readFileSync('fullchain.pem')
};

https.createServer(options, app).listen(443);
```

#### 6. Security Headers

**Use Helmet:**
```javascript
const helmet = require('helmet');

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

#### 7. MongoDB Security

**Configuration:**
```javascript
// Enable authentication
use admin
db.createUser({
  user: "twitterAdmin",
  pwd: "securePassword",
  roles: [
    { role: "readWrite", db: "twitterData" }
  ]
});

// Connection with auth
mongoose.connect('mongodb://username:password@localhost:27017/twitterData', {
  authSource: 'admin'
});
```

### Vulnerability Scanning

**npm audit:**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically (non-breaking)
npm audit fix

# Fix with breaking changes
npm audit fix --force
```

**Current Known Issues:**
- `twit` package: No maintained alternatives for Twitter API v1.1
- Development dependencies: Not deployed to production

---

## Scalability Considerations

### Horizontal Scaling

**Load Balancing Multiple Backend Instances:**

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │
       ▼
┌──────────────┐
│ Load Balancer│ (Nginx, HAProxy)
│  (Round Robin)│
└──────┬───────┘
       │
       ├─────────────┬─────────────┬─────────────┐
       ▼             ▼             ▼             ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Backend  │  │ Backend  │  │ Backend  │  │ Backend  │
│Instance 1│  │Instance 2│  │Instance 3│  │Instance 4│
└─────┬────┘  └─────┬────┘  └─────┬────┘  └─────┬────┘
      │             │             │             │
      └─────────────┴─────────────┴─────────────┘
                        │
                        ▼
                ┌───────────────┐
                │   MongoDB     │
                │   Replica Set │
                └───────────────┘
```

**Nginx Configuration:**
```nginx
upstream backend {
    least_conn;  # Route to server with least connections
    server backend1:3000;
    server backend2:3000;
    server backend3:3000;
    server backend4:3000;
}

server {
    listen 80;
    location /api/ {
        proxy_pass http://backend;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Database Scaling

#### 1. MongoDB Replica Set

**Purpose:** High availability + read scaling

```javascript
// Connection string with replica set
mongoose.connect(
  'mongodb://host1:27017,host2:27017,host3:27017/twitterData?replicaSet=rs0',
  {
    readPreference: 'secondaryPreferred'  // Read from secondaries
  }
);
```

**Architecture:**
```
┌─────────────┐
│   Primary   │ ← Writes go here
│   (Master)  │
└──────┬──────┘
       │ Replication
       ├──────────────┬──────────────┐
       ▼              ▼              ▼
┌────────────┐  ┌────────────┐  ┌────────────┐
│ Secondary 1│  │ Secondary 2│  │ Secondary 3│
│ (Read)     │  │ (Read)     │  │ (Read)     │
└────────────┘  └────────────┘  └────────────┘
```

#### 2. MongoDB Sharding

**Purpose:** Horizontal partitioning for massive datasets

**Shard Key Strategy:**
```javascript
// Shard by date range (time-series data)
sh.shardCollection("twitterData.tweets", { created_at: 1 });

// Or by hash (better distribution)
sh.shardCollection("twitterData.tweets", { id_str: "hashed" });
```

**When to Shard:**
- Database > 500 GB
- Single server can't handle load
- Need geographic distribution

### Caching Strategy

#### 1. Application-Level Caching

**Redis for API Responses:**
```javascript
const redis = require('redis');
const client = redis.createClient();

// Cache middleware
async function cacheMiddleware(req, res, next) {
  const key = `api:${req.originalUrl}`;

  const cached = await client.get(key);
  if (cached) {
    return res.json(JSON.parse(cached));
  }

  // Override res.json to cache response
  const originalJson = res.json.bind(res);
  res.json = (data) => {
    client.setex(key, 300, JSON.stringify(data)); // Cache 5 min
    return originalJson(data);
  };

  next();
}

// Use in routes
router.get('/stats', cacheMiddleware, async (req, res) => {
  // Expensive operation
  const stats = await calculateStats();
  res.json(stats);
});
```

#### 2. Database Query Caching

**Mongoose Cache:**
```javascript
const mongoose = require('mongoose');
const cachegoose = require('cachegoose');

cachegoose(mongoose, {
  engine: 'redis',
  port: 6379,
  host: 'localhost'
});

// Cache query for 60 seconds
const tweets = await TweetsDB.tweetsREST
  .find({})
  .limit(100)
  .cache(60)
  .exec();
```

### Message Queue for Background Jobs

**Bull Queue for Clustering:**
```javascript
const Queue = require('bull');
const clusteringQueue = new Queue('clustering', 'redis://127.0.0.1:6379');

// Add job
clusteringQueue.add({
  userId: req.user.id,
  parameters: req.body
});

// Process job
clusteringQueue.process(async (job) => {
  const result = await clustering.minhashLshClustering(job.data);
  return result;
});

// Job completed
clusteringQueue.on('completed', (job, result) => {
  logger.info(`Clustering job ${job.id} completed`);
  // Notify user via WebSocket or email
});
```

---

## Testing Strategy

### Unit Testing

**Framework:** Jest

**Example Tests:**
```javascript
// analytics.test.js
const analytics = require('../controller/analytics');

describe('Analytics Module', () => {
  beforeEach(async () => {
    // Setup test database
    await setupTestDB();
  });

  afterEach(async () => {
    // Cleanup
    await cleanupTestDB();
  });

  test('countTotalTweetsCollected returns correct count', async () => {
    // Arrange
    await insertTestTweets(100);

    // Act
    const result = await analytics.countTotalTweetsCollected();

    // Assert
    expect(result.total).toBe(100);
  });

  test('handles empty database gracefully', async () => {
    const result = await analytics.countTotalTweetsCollected();
    expect(result.total).toBe(0);
  });
});
```

### Integration Testing

**Framework:** Supertest + Jest

**Example:**
```javascript
const request = require('supertest');
const app = require('../app');

describe('GET /api/tweets/stats', () => {
  test('returns statistics object', async () => {
    const response = await request(app)
      .get('/api/tweets/stats')
      .expect('Content-Type', /json/)
      .expect(200);

    expect(response.body).toHaveProperty('success', true);
    expect(response.body.data).toHaveProperty('totals');
    expect(response.body.data).toHaveProperty('collections');
  });

  test('handles database errors', async () => {
    // Mock database error
    jest.spyOn(TweetsDB.tweetsREST, 'countDocuments')
      .mockRejectedValue(new Error('Database error'));

    const response = await request(app)
      .get('/api/tweets/stats')
      .expect(500);

    expect(response.body.success).toBe(false);
  });
});
```

### Performance Testing

**Tool:** Apache Bench (ab)

```bash
# Test API endpoint
ab -n 1000 -c 10 http://localhost:3000/api/status

# Results to expect:
# Requests per second: 500-1000
# Mean time per request: 10-20ms
# 95th percentile: <50ms
```

### Load Testing

**Tool:** Artillery

```yaml
# load-test.yml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "API endpoints"
    flow:
      - get:
          url: "/api/status"
      - get:
          url: "/api/tweets/rest"
      - get:
          url: "/api/analytics/stats"
```

---

## Appendix

### System Requirements Summary

**Minimum Requirements:**
- CPU: 2 cores
- RAM: 2 GB
- Disk: 20 GB
- Network: 10 Mbps
- OS: Linux, macOS, Windows

**Recommended Requirements:**
- CPU: 4+ cores
- RAM: 8 GB
- Disk: 100 GB SSD
- Network: 100 Mbps
- OS: Ubuntu 20.04 LTS

### Performance Benchmarks

```
Operation              | 10K tweets | 100K tweets | 1M tweets
-----------------------|------------|-------------|------------
Count query           | 5ms        | 8ms         | 15ms
Simple find           | 20ms       | 150ms       | 800ms
Aggregate pipeline    | 100ms      | 1.2s        | 12s
Full analytics        | 500ms      | 5s          | 45s
Clustering            | 3s         | 32s         | 340s
```

### API Rate Limits (Recommended)

```
Endpoint                    | Limit           | Window
----------------------------|-----------------|----------
GET /api/tweets/*          | 100 req         | 15 min
GET /api/analytics/*       | 50 req          | 15 min
GET /api/clustering/*      | 5 req           | 1 hour
All endpoints              | 1000 req        | 1 hour
```

---

**End of Technical Specifications**
**Version 2.0 | November 2025**
