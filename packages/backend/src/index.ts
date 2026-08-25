import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import path from 'path';
import { fileRouter } from './routes/files';
import { projectRouter } from './routes/projects';
import { terminalRouter } from './routes/terminal';
import { agentRouter } from './routes/agent';
import { initializeDatabase } from './db/database';
import { setupWebSocket } from './websocket/ws-handler';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;
const WORKSPACE_DIR = process.env.WORKSPACE_DIR || path.join(process.cwd(), 'workspace');

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/projects', projectRouter);
app.use('/api/files', fileRouter);
app.use('/api/terminal', terminalRouter);
app.use('/api/agent', agentRouter);

// Error handling
app.use((err: any, req: Request, res: Response, next: any) => {
  console.error('Error:', err);
  res.status(err.statusCode || 500).json({
    error: err.message || 'Internal server error'
  });
});

// Initialize database and start server
async function main() {
  try {
    // Initialize SQLite database
    await initializeDatabase();
    console.log('Database initialized');

    // Create HTTP server with WebSocket support
    const server = createServer(app);
    const wss = new WebSocketServer({ server });

    // Setup WebSocket handlers
    setupWebSocket(wss);

    server.listen(PORT, () => {
      console.log(`\n🔗 ChainForge AI Backend running on http://localhost:${PORT}`);
      console.log(`📁 Workspace: ${WORKSPACE_DIR}`);
      console.log(`WebSocket: ws://localhost:${PORT}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
