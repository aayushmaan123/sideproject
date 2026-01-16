/**
 * Main application entry point
 * AI Website Builder Backend - Stages 4.1.1, 4.1.2, 4.2 & 4.3
 */

import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import inputRoutes from './routes/input';
import extractRoutes from './routes/extract';
import requirementsRoutes from './routes/requirements';
import { Logger } from './utils/logger';
import { testConnection, syncDatabase } from './database/config';
import { seedTemplates } from './database/seedTemplates';

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON request bodies
app.use(express.json());

// Middleware to parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'AI Website Builder - Input Validation, AI Extraction, Storage & Template Selection',
  });
});

// API routes
app.use('/api', inputRoutes);
app.use('/api', extractRoutes);
app.use('/api', requirementsRoutes);

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
  });
});

// Error handler
app.use((err: Error, _req: Request, res: Response) => {
  Logger.error('Unhandled error', err);
  res.status(500).json({
    error: 'Internal Server Error',
  });
});

// Initialize database and start server (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  (async () => {
    try {
      // Test database connection
      const connected = await testConnection();
      if (!connected) {
        throw new Error('Database connection failed');
      }

      // Sync database models
      await syncDatabase();

      // Seed templates
      await seedTemplates();

      // Start server
      app.listen(PORT, () => {
        Logger.info(`Server running on port ${PORT}`);
        console.log(`🚀 AI Website Builder Backend started on http://localhost:${PORT}`);
        console.log(`📝 Stage 4.1.1 - Input validation: POST http://localhost:${PORT}/api/input`);
        console.log(`🤖 Stage 4.1.2 - AI extraction: POST http://localhost:${PORT}/api/extract`);
        console.log(`💾 Stage 4.2 - Save requirements: POST http://localhost:${PORT}/api/requirements`);
        console.log(`📖 Stage 4.2 - Get requirements: GET http://localhost:${PORT}/api/requirements/:session_id`);
        console.log(`🎨 Stage 4.3 - Template selection: GET http://localhost:${PORT}/api/templates/select/:session_id`);
        console.log(`🏥 Health check: GET http://localhost:${PORT}/health`);
      });
    } catch (error) {
      Logger.error('Failed to initialize application', error);
      process.exit(1);
    }
  })();
}

export default app;
