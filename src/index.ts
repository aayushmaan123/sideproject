/**
 * Main application entry point
 * AI Website Builder Backend - Stages 4.1.1 & 4.1.2
 */

import 'dotenv/config';
import express, { Application, Request, Response } from 'express';
import inputRoutes from './routes/input';
import extractRoutes from './routes/extract';
import { Logger } from './utils/logger';

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
    service: 'AI Website Builder - Input Validation & AI Requirement Extraction',
  });
});

// API routes
app.use('/api', inputRoutes);
app.use('/api', extractRoutes);

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

// Start server (only if not in test environment)
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    Logger.info(`Server running on port ${PORT}`);
    console.log(`🚀 AI Website Builder Backend started on http://localhost:${PORT}`);
    console.log(`📝 Stage 4.1.1 - Input validation: POST http://localhost:${PORT}/api/input`);
    console.log(`🤖 Stage 4.1.2 - AI extraction: POST http://localhost:${PORT}/api/extract`);
    console.log(`🏥 Health check: GET http://localhost:${PORT}/health`);
  });
}

export default app;
