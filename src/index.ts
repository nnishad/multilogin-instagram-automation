import express from 'express';
import logger from './custom-logger';
import router from './routes/routes';
import mongoose from 'mongoose';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './swagger'; // Import your Swagger configuration file

import dotenv from 'dotenv';
import { Request, Response, NextFunction } from 'express-serve-static-core';

dotenv.config();

const app = express();

// Middleware to parse request body as JSON
app.use(express.json());

// Other app configurations and middleware

// Swagger UI setup
app.use(
    '/api',
    swaggerUi.serve,
    (req: Request, res: Response, next: NextFunction) => {
        const serverUrl = `${req.protocol}://${req.get('host')}`;
        const swaggerConfig = { ...swaggerSpec, servers: [{ url: serverUrl }] };
        swaggerUi.setup(swaggerConfig)(req, res, next);
    },
);
app.use(router);

// Define the MongoDB connection URL
const MONGODB_URI = process.env.MONGODB_URI ?? '';

// Connect to MongoDB
mongoose
    .connect(MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName: "multilogin"
    } as mongoose.ConnectOptions)
    .then(() => {
        logger.info('Connected to MongoDB');
        app.listen(3001, () => {
            logger.info('Server is running on port 3001');
        });
    })
    .catch((error) => {
        logger.info('Failed to connect to MongoDB', error);
    });
