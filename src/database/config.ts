/**
 * Database configuration and connection setup
 */

import { Sequelize } from 'sequelize';
import { Logger } from '../utils/logger';

// Database file path (SQLite)
const DB_PATH = process.env.DB_PATH || './data/requirements.db';

// Create Sequelize instance with SQLite
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: DB_PATH,
  logging: (msg) => Logger.info('Database query', { query: msg }),
  define: {
    timestamps: true, // Automatically add createdAt and updatedAt
    underscored: false, // Use camelCase instead of snake_case
  },
});

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await sequelize.authenticate();
    Logger.info('Database connection established successfully', {
      dialect: 'sqlite',
      storage: DB_PATH,
    });
    return true;
  } catch (error) {
    Logger.error('Unable to connect to the database', error);
    return false;
  }
}

/**
 * Synchronize database models
 */
export async function syncDatabase(force = false): Promise<void> {
  try {
    await sequelize.sync({ force });
    Logger.info('Database synchronized successfully', { force });
  } catch (error) {
    Logger.error('Failed to synchronize database', error);
    throw error;
  }
}

/**
 * Close database connection
 */
export async function closeConnection(): Promise<void> {
  try {
    await sequelize.close();
    Logger.info('Database connection closed');
  } catch (error) {
    Logger.error('Error closing database connection', error);
  }
}
