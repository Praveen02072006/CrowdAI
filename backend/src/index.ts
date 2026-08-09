import express from 'express';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';

import { authRouter } from './routes/auth';
import { routesRouter } from './routes/routes';
import { vehiclesRouter } from './routes/vehicles';
import { recommendationsRouter } from './routes/recommendations';
import { simulatorRouter } from './routes/simulator';
import { operatorRouter } from './routes/operator';
import { adminRouter } from './routes/admin';
import { notificationsRouter } from './routes/notifications';
import { stopsRouter } from './routes/stops';
import { setupSocketIO } from './socket/socketHandler';
import { errorHandler } from './middleware/errorHandler';
import { prisma } from './database/client';

dotenv.config();

const app = express();
const server = http.createServer(app);

// ─── Allowed CORS origins ────────────────────────────────────────────────────
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  ...(process.env.CLIENT_URL ? [process.env.CLIENT_URL.replace(/\/$/, '')] : []),
];

const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    console.warn(`CORS: Blocked origin: ${origin}`);
    callback(new Error(`CORS: Origin ${origin} is not allowed`));
  },
  credentials: true,
};

// ─── Socket.IO ───────────────────────────────────────────────────────────────
export const io = new Server(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSocketIO(io);

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginEmbedderPolicy: false }));
app.use(cors(corsOptions));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
app.use('/api/', limiter);

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/routes', routesRouter);
app.use('/api/stops', stopsRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/simulator', simulatorRouter);
app.use('/api/operator', operatorRouter);
app.use('/api/admin', adminRouter);
app.use('/api/notifications', notificationsRouter);

// ─── Health Check ─────────────────────────────────────────────────────────────
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ success: true, message: 'Yatra IQ Backend is running', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ success: false, message: 'Database unavailable' });
  }
});

app.get('/api', (_req, res) => {
  res.json({
    success: true,
    message: 'Yatra IQ API',
    version: '1.0.0',
    tagline: 'Know the crowd before you board.',
  });
});

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Error Handler ────────────────────────────────────────────────────────────
app.use(errorHandler);

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = parseInt(process.env.PORT || '3001', 10);
server.listen(PORT, () => {
  console.log(`\n🚀 Yatra IQ Backend running on port ${PORT}`);
  console.log(`📡 Socket.IO ready`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health\n`);
});

export default app;
