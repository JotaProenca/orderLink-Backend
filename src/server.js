require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Importa as rotas
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');

const prisma = new PrismaClient();
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração de middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Configuração do Swagger
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API OrderLink',
      version: '1.0.0',
      description: 'Documentação da API para o App OrderLink',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
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
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./server.js', './src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Verifica a saúde da API
 *     description: Retorna o status da API e a hora atual. Não requer autenticação.
 *     security: []
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API está funcionando
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: OK
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 */
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Configuração das rotas
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Algo deu errado no servidor!' });
});

// Inicialização do servidor
const startServer = async () => {
  try {
    await prisma.$connect();
    console.log(`Conectado ao banco de dados: ${process.env.DATABASE_TYPE || 'Tipo não definido'}`);

    app.listen(PORT, () => {
      console.log(`Servidor backend rodando em http://localhost:${PORT}`);
      console.log(`Documentação Swagger disponível em http://localhost:${PORT}/api/docs`);
    });
  } catch (error) {
    console.error('Falha ao iniciar o servidor ou conectar ao banco de dados:', error);
    process.exit(1);
  }
};

startServer();

// Garante desconexão do Prisma ao encerrar
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  console.log('Desconectado do banco de dados.');
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Desconectado do banco de dados devido ao encerramento da aplicação.');
  process.exit(0);
});