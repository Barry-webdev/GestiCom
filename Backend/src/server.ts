import express, { Application } from 'express';
import cors from 'cors';
import compression from 'compression';
import dotenv from 'dotenv';
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

// Import routes
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

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Security Middleware (DOIT ÊTRE EN PREMIER)
app.use(helmetConfig); // Protection headers HTTP
app.use(requestTimeout(30000)); // Timeout de 30 secondes
app.use(securityLogger); // Logger les requêtes suspectes
app.use(payloadSizeCheck); // Vérifier la taille des payloads

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true
}));

// Compression middleware pour réduire la taille des réponses
app.use(compression());

// Body parsing avec limite
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting général
app.use('/api/', generalLimiter);

// Setup Swagger documentation
setupSwagger(app);

// Routes avec rate limiting spécifique
app.use('/api/auth', authLimiter, authRoutes); // Rate limiting strict pour auth
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'GestiStock API is running' });
});

// Error handling middleware
app.use(errorHandler);

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
    console.log(`🔒 Security: Helmet, Rate Limiting, XSS Protection enabled`);
  });
}).catch((error) => {
  console.error('❌ Failed to connect to database:', error);
  process.exit(1);
});

export default app;
