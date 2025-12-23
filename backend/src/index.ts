import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env, connectDatabase, connectRedis, disconnectDatabase, disconnectRedis } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';
import routes from './routes/index.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
    origin: env.frontendUrl,
    credentials: true,
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.nodeEnv !== 'test') {
    app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
}

// API routes
app.use('/api', routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Graceful shutdown
async function shutdown() {
    console.log('\nShutting down gracefully...');
    await disconnectDatabase();
    await disconnectRedis();
    process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Start server
async function start() {
    try {
        // Connect to database
        await connectDatabase();

        // Connect to Redis (optional - continues if unavailable)
        await connectRedis();

        // Start Express server
        app.listen(env.port, () => {
            console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🚀 HOMELIA BACKEND SERVER                           ║
║                                                        ║
║   Status:      Running                                 ║
║   Environment: ${env.nodeEnv.padEnd(40)}║
║   Port:        ${env.port.toString().padEnd(40)}║
║   API URL:     http://localhost:${env.port}/api${' '.repeat(18)}║
║                                                        ║
╚════════════════════════════════════════════════════════╝
      `);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

start();

export default app;
