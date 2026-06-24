import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import path from 'path';
import { config } from './config';
import { errorHandler } from './middleware/errorHandler';
import { startScheduler } from './services/schedulerService';
import authRoutes from './routes/auth';
import brandsRoutes from './routes/brands';
import reviewSourcesRoutes from './routes/reviewSources';
import reviewsRoutes from './routes/reviews';
import productsRoutes from './routes/products';
import screensRoutes from './routes/screens';
import templatesRoutes from './routes/templates';
import syncRoutes from './routes/sync';
import publicRoutes from './routes/public';
import uploadsRoutes from './routes/uploads';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Geüploade afbeeldingen serveren als statische bestanden
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/brands', brandsRoutes);
app.use('/api/review-sources', reviewSourcesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/screens', screensRoutes);
app.use('/api/templates', templatesRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/uploads', uploadsRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`);
  startScheduler();
});
