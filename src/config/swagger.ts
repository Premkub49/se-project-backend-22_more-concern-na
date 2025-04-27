import swaggerJsdoc from 'swagger-jsdoc';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'SE Project Backend API',
      version: '1.0.0',
      description: 'API documentation for the SE Project Backend',
    },
    servers: [
      {
        url: 'http://localhost:5050',
        description: 'Development server',
      },
    //   {
    //     url: 'https://se-project-backend-22-more-concern-na.vercel.app',
    //     description: 'Production server'
    //   }
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            email: { type: 'string' },
            tel: { type: 'string' },
            picture: { type: 'string' },
            role: { type: 'string', enum: ['user', 'admin', 'hotelManager'] },
            hotel: { type: 'string' },
            point: { type: 'integer' },
            inventory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  redeemableId: { type: 'string' },
                  count: { type: 'integer' },
                },
              },
            },
          },
        },
        Hotel: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            description: { type: 'string' },
            picture: { type: 'string' },
            buildingNumber: { type: 'string' },
            street: { type: 'string' },
            district: { type: 'string' },
            province: { type: 'string' },
            postalCode: { type: 'string' },
            tel: { type: 'string' },
            rooms: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  roomType: { type: 'string' },
                  picture: { type: 'string' },
                  capacity: { type: 'integer' },
                  maxCount: { type: 'integer' },
                  price: { type: 'number' },
                },
              },
            },
            ratingSum: { type: 'integer' },
            ratingCount: { type: 'integer' },
          },
        },
        Booking: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            user: { type: 'string' },
            hotel: { type: 'string' },
            status: { type: 'string', enum: ['reserved', 'checkedIn', 'completed'] },
            price: { type: 'number' },
            startDate: { type: 'string', format: 'date' },
            endDate: { type: 'string', format: 'date' },
            rooms: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  roomType: { type: 'string' },
                  count: { type: 'integer' },
                },
              },
            },
          },
        },
        Review: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            booking: { type: 'string' },
            rating: { type: 'integer', minimum: 1, maximum: 5 },
            reply: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                text: { type: 'string' },
              },
            },
            title: { type: 'string' },
            text: { type: 'string' },
          },
        },
        Redeemable: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            type: { type: 'string', enum: ['gift', 'coupon'] },
            name: { type: 'string' },
            description: { type: 'string' },
            picture: { type: 'string' },
            point: { type: 'integer' },
            discount: { type: 'number' },
            expire: { type: 'string', format: 'date' },
            remain: { type: 'integer' },
          },
        },
        Report: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            review: { type: 'string' },
            reportDate: { type: 'string', format: 'date' },
            reportReason: {
              type: 'string',
              enum: ['pedo', 'bully', 'suicide', 'violence', 'nsfw', 'spam', 'scam', 'other'],
            },
            isIgnore: { type: 'boolean' },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.ts'], // Include all route files
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
