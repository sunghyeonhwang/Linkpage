import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { errorHandler } from './middleware/error.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import linkRoutes from './routes/link.js';
import publicRoutes from './routes/public.js';

const app = express();

app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/me/profile', profileRoutes);
app.use('/api/me/links', linkRoutes);
app.use('/api/public', publicRoutes);

// Error handler
app.use(errorHandler);

export default app;
