// ⚠️ dotenv DOIT être chargé EN PREMIER avant tout autre import
import dotenv from 'dotenv';
dotenv.config();

import express, { Application } from 'express';
import cors from 'cors';
import compression from 'compression';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { setupSwagger } from './config/swagger';
import {
  generalLimiter,
  authLimiter,
  helmetConfig,
  requestTimeout,
  securityLogger,
  payloadSizeCheck
} from './middleware/security';

import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import clientRoutes from './routes/client.routes';
import supplierRoutes from './routes/supplier.routes';
import saleRoutes from './routes/sale.routes';
import stockRoutes from './routes/stock.routes';
import userRoutes from './routes/user.routes';
import dashboardRoutes from './routes/dashboard.routes';
import companyRoutes from './routes/company.routes';
import notificationRoutes from './routes/notification.routes';
import reportRoutes from './routes/report.routes';
import partnerRoutes from './routes/partner.routes';
import fundEntryRoutes from './routes/fundEntry.routes';

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security DOIT être en premier
app.use(helmetConfig);
app.use(requestTimeout(30000));
app.use(securityLogger);
app.use(payloadSizeCheck);

// Rate limiting général AVANT tout traitement
app.use('/api/', generalLimiter);

// CORS avec headers explicites
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:8080',
  'http://localhost:5173',
  'http://localhost:3000',
];
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
}));

app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

setupSwagger(app);

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/sales', saleRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/users', userRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/company', companyRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/fund-entries', fundEntryRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK', uptime: process.uptime() });
});

app.use(errorHandler);

connectDB().then(() => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    server.close(() => process.exit(0));
  };
  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);

}).catch((error) => {
  console.error('❌ Failed to connect to database:', error);
  process.exit(1);
});

export default app;
