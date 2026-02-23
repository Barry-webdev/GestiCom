import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Application } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GestiStock API',
      version: '1.0.0',
      description: 'API de gestion de stock pour Barry & Fils - Pita, Guinée',
      contact: {
        name: 'Barry & Fils',
        email: 'contact@barryetfils.gn',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Serveur de développement',
      },
      {
        url: 'https://api.gestistock.gn',
        description: 'Serveur de production',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
            },
            message: {
              type: 'string',
              example: 'Message d\'erreur',
            },
          },
        },
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['admin', 'gestionnaire', 'vendeur', 'lecteur'] },
            status: { type: 'string', enum: ['active', 'inactive'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            category: { type: 'string' },
            quantity: { type: 'number' },
            unit: { type: 'string' },
            buyPrice: { type: 'number' },
            sellPrice: { type: 'number' },
            alertThreshold: { type: 'number' },
            status: { type: 'string', enum: ['in_stock', 'low', 'out'] },
            supplier: { type: 'string' },
            image: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Client: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            address: { type: 'string' },
            totalPurchases: { type: 'number' },
            lastPurchase: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['active', 'inactive', 'vip'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Supplier: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string' },
            phone: { type: 'string' },
            email: { type: 'string' },
            address: { type: 'string' },
            contact: { type: 'string' },
            totalValue: { type: 'number' },
            lastDelivery: { type: 'string', format: 'date-time' },
            status: { type: 'string', enum: ['active', 'inactive'] },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Sale: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            invoiceNumber: { type: 'string' },
            client: { type: 'string' },
            items: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  product: { type: 'string' },
                  quantity: { type: 'number' },
                  price: { type: 'number' },
                  total: { type: 'number' },
                },
              },
            },
            subtotal: { type: 'number' },
            tax: { type: 'number' },
            total: { type: 'number' },
            paymentMethod: { type: 'string', enum: ['Espèces', 'Mobile Money', 'Virement', 'Crédit'] },
            status: { type: 'string', enum: ['pending', 'completed', 'cancelled'] },
            user: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: 'Auth', description: 'Authentification et autorisation' },
      { name: 'Products', description: 'Gestion des produits' },
      { name: 'Clients', description: 'Gestion des clients' },
      { name: 'Suppliers', description: 'Gestion des fournisseurs' },
      { name: 'Sales', description: 'Gestion des ventes' },
      { name: 'Stock', description: 'Gestion du stock' },
      { name: 'Users', description: 'Gestion des utilisateurs' },
      { name: 'Dashboard', description: 'Statistiques et tableaux de bord' },
      { name: 'Reports', description: 'Rapports et exports' },
      { name: 'Notifications', description: 'Notifications en temps réel' },
      { name: 'Company', description: 'Informations de l\'entreprise' },
    ],
  },
  apis: ['./src/routes/*.ts', './src/controllers/*.ts'],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Application): void => {
  // Swagger UI
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'GestiStock API Documentation',
  }));

  // JSON endpoint
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger documentation available at /api-docs');
};

export default swaggerSpec;
