/**
 * MongoDB Memory Server Configuration
 * This module provides an in-memory MongoDB instance for testing
 * without requiring a local MongoDB installation
 */

const { MongoMemoryServer } = require('mongodb-memory-server');
const logger = require('../logger-config/log-config');

let mongoServer = null;

/**
 * Start MongoDB Memory Server
 * @returns {Promise<string>} MongoDB connection URI
 */
async function startMongoMemoryServer() {
    try {
        mongoServer = await MongoMemoryServer.create({
            instance: {
                dbName: 'sampleData',
                port: 27017 // Use default MongoDB port
            }
        });

        const uri = mongoServer.getUri();
        logger.info('MongoDB Memory Server started successfully at: ' + uri);
        return uri;
    } catch (error) {
        logger.error('Failed to start MongoDB Memory Server: ' + error);
        throw error;
    }
}

/**
 * Stop MongoDB Memory Server
 */
async function stopMongoMemoryServer() {
    if (mongoServer) {
        await mongoServer.stop();
        logger.info('MongoDB Memory Server stopped');
    }
}

module.exports = {
    startMongoMemoryServer,
    stopMongoMemoryServer
};
