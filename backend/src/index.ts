import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env, connectDatabase, connectRedis, disconnectDatabase, disconnectRedis } from './config/index.js';
import { errorHandler, notFoundHandler } from './middleware/index.js';
import routes from './routes/index.js';

const app = express();

// DEBUG: Log every request
app.use((req, res, next) => {
    console.log(`[DEBUG] HIT: ${req.method} ${req.url}`);
    next();
});

// DEBUG: Root route
app.get('/', (req, res) => {
    res.send('BACKEND IS RUNNING');
});

// Security middleware - configure helmet to not block CORS
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
}));

// CORS - allow multiple origins
const allowedOrigins = [
    env.frontendUrl,
    'https://www.homelia.studio',
    'https://homelia.studio',
    'https://homelia-peach.vercel.app',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:3000',
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);

        // Check if origin matches allowed list or is a vercel preview URL
        if (allowedOrigins.includes(origin) || origin.includes('.vercel.app')) {
            return callback(null, true);
        }

        // Log blocked origins for debugging
        console.log(`[CORS] Blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
}));

// Request parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
if (env.nodeEnv !== 'test') {
    app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));
}

// API routes
// Debug output
console.log('Mounting routes:', routes);

app.get('/test-ping', (req, res) => res.send('PONG'));
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
        app.listen(env.port, '0.0.0.0', () => {
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
