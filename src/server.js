import express from 'express';
import mongoose from 'mongoose';
import chalk from 'chalk';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';
import config from './config/config.js';
import errorHandler from './middleware/errorHandler.js';
import { ROUTES } from './config/routes.config.js';
import authRoutes from './routes/auth.routes.js';
import adminRoutes from './routes/admin.routes.js';
import userRoutes from './routes/user.routes.js';

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());

// Health check endpoint for Render
app.get('/api/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

// Mount routes directly
app.use(ROUTES.AUTH, authRoutes);
app.use(ROUTES.ADMIN, adminRoutes);
app.use(ROUTES.USERS, userRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Error Handler
app.use(errorHandler);

// Database Connection
mongoose.connect(config.mongoUri)
    .then(() => {
        console.log(
            chalk.green.bold('✓ Database Connection'),
            chalk.green('Successfully connected to MongoDB')
        );
        
        app.listen(config.port, () => {
            console.log(
                chalk.blue.bold('✓ Server Status'),
                chalk.blue(`Running on port ${chalk.bold(config.port)}`),
                '\n',
                chalk.cyan(`📚 API Docs: http://localhost:${config.port}/api-docs`),
                '\n',
                chalk.cyan(`🚀 Environment: ${config.env}`)
            );
        });
    })
    .catch((err) => {
        console.error(
            chalk.red.bold('✗ Database Error'),
            chalk.red(err.message),
            '\n',
            chalk.yellow(err.stack)
        );
        process.exit(1);
    });
