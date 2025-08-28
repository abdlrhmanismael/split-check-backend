const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order Splitter API',
      version: '1.0.0',
      description: 'A Node.js Express backend for splitting orders with taxes and services among friends',
      contact: {
        name: 'API Support',
        email: 'support@ordersplitter.com'
      },
      license: {
        name: 'ISC',
        url: 'https://opensource.org/licenses/ISC'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? process.env.BASE_URL || 'https://your-app.render.com'
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      schemas: {
        Session: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string',
              description: 'Unique session identifier'
            },
            totalOrderAmount: {
              type: 'number',
              description: 'Total order amount'
            },
            taxPercentage: {
              type: 'number',
              description: 'Tax percentage (0-100)'
            },
            servicePercentage: {
              type: 'number',
              description: 'Service percentage (0-100)'
            },
            deliveryFee: {
              type: 'number',
              description: 'Delivery fee amount'
            },
            numberOfFriends: {
              type: 'integer',
              description: 'Number of friends expected to join'
            },
            instaPayURL: {
              type: 'string',
              description: 'InstaPay payment URL'
            },
                         billImage: {
               type: 'string',
               description: 'Cloudinary URL of the uploaded bill image'
             },
            friends: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Friend'
              }
            },
            isActive: {
              type: 'boolean',
              description: 'Whether the session is active'
            },
            createdAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Friend: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              description: 'Friend identifier'
            },
            name: {
              type: 'string',
              description: 'Friend name'
            },
            products: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Product'
              }
            },
            paymentMethod: {
              type: 'boolean',
              description: 'Payment method (true for InstaPay, false for cash)'
            },
            subtotal: {
              type: 'number',
              description: 'Subtotal of products'
            },
            taxAmount: {
              type: 'number',
              description: 'Calculated tax amount'
            },
            serviceAmount: {
              type: 'number',
              description: 'Calculated service amount'
            },
            deliveryShare: {
              type: 'number',
              description: 'Share of delivery fee'
            },
            totalAmount: {
              type: 'number',
              description: 'Total amount to pay'
            },
            hasPaid: {
              type: 'boolean',
              description: 'Whether the friend has paid'
            },
            joinedAt: {
              type: 'string',
              format: 'date-time'
            }
          }
        },
        Product: {
          type: 'object',
          properties: {
            productName: {
              type: 'string',
              description: 'Name of the product'
            },
            unitPrice: {
              type: 'number',
              description: 'Price per unit'
            },
            quantity: {
              type: 'integer',
              description: 'Quantity ordered'
            }
          },
          required: ['productName', 'unitPrice', 'quantity']
        },
        SessionSummary: {
          type: 'object',
          properties: {
            sessionId: {
              type: 'string'
            },
            totalOrderAmount: {
              type: 'number'
            },
            totalPaidInstaPay: {
              type: 'number'
            },
            totalPaidCash: {
              type: 'number'
            },
            totalUnpaid: {
              type: 'number'
            },
            friendsCount: {
              type: 'integer'
            },
            expectedFriendsCount: {
              type: 'integer'
            },
            friends: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Friend'
              }
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message'
            },
            details: {
              type: 'string',
              description: 'Additional error details'
            }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js', './controllers/*.js', './server.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
