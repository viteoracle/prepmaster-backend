const express = require('express');
const mongoose = require('mongoose');
const chalk = require('chalk');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./config/swagger');
const config = require('./config/config');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(compression());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api', require('./routes'));

// Error Handler
app.use(errorHandler);

// Database Connection
mongoose.connect(config.mongoUri)
    .then(() => {
        console.log(chalk.green('✓ Connected to MongoDB'));
        app.listen(config.port, () => {
            console.log(chalk.blue(`✓ Server is running on port ${config.port}`));
        });
    })
    .catch((err) => {
        console.error(chalk.red('✗ MongoDB connection error:'), err);
        process.exit(1);
    });
