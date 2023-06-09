import swaggerJSDoc from 'swagger-jsdoc';
import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

const swaggerOptions: swaggerJSDoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Your API Title',
      version: '1.0.0',
      description: 'API documentation using Swagger',
    },
    components: {
      schemas: {
        Alert: {
          type: 'object',
          properties: {
            // Define your properties here
            // For example:
            locationIdentifier: {
              type: 'string',
            },
            radius: {
              type: 'number',
            },
            maxPrice: {
              type: 'number',
            },
            minBedrooms: {
              type: 'number',
            },
            letFurnishType: {
              type: 'string',
            },
            taggedUsers: {
              type: 'array',
              items: {
                type: 'string',
              },
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
            },
          },
        },
      },
    },
  },
  apis: ['**/*.ts'],
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

export default swaggerSpec;
