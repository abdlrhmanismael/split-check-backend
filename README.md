# Order Splitter Backend

A Node.js Express backend application for splitting orders with taxes and services among friends. This application allows users to create sessions, add friends, and calculate individual shares including taxes, service charges, and delivery fees.

## Features

- **Session Management**: Create and manage order splitting sessions
- **Friend Management**: Add friends to sessions with their individual orders
- **Automatic Calculations**: Calculate taxes, service charges, and delivery fees
- **Payment Tracking**: Track payment status for each friend
- **File Upload**: Upload bill images for reference
- **Session Summary**: Get detailed summaries of sessions
- **Input Validation**: Comprehensive validation for all inputs
- **Error Handling**: Robust error handling and responses

## Tech Stack

- **Node.js** with **Express.js**
- **MongoDB** with **Mongoose**
- **Multer** for file uploads
- **express-validator** for input validation
- **UUID** for unique session generation
- **Helmet** for security headers
- **CORS** for cross-origin requests
- **Morgan** for logging

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd order-splitter-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/order-splitter
   NODE_ENV=development
   UPLOAD_PATH=./uploads
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use a cloud instance.

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

The server will start on `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Health Check
```
GET /health
```

### 1. Create Session
**POST** `/sessions`

Create a new order splitting session.

**Request Body (multipart/form-data):**
```json
{
  "totalOrderAmount": 150.00,
  "taxPercentage": 15.0,
  "servicePercentage": 10.0,
  "deliveryFee": 5.00,
  "numberOfFriends": 3,
  "instaPayURL": "https://instapay.com/pay/123",
  "billImage": [file upload]
}
```

**Response:**
```json
{
  "message": "Session created successfully",
  "session": {
    "sessionId": "uuid-string",
    "sessionLink": "http://localhost:3000/session/uuid-string",
    "totalOrderAmount": 150.00,
    "taxPercentage": 15.0,
    "servicePercentage": 10.0,
    "deliveryFee": 5.00,
    "numberOfFriends": 3,
    "instaPayURL": "https://instapay.com/pay/123",
    "billImage": "bill-1234567890.jpg",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get Session Details
**GET** `/sessions/:id`

Get details of a specific session.

**Response:**
```json
{
  "session": {
    "sessionId": "uuid-string",
    "totalOrderAmount": 150.00,
    "taxPercentage": 15.0,
    "servicePercentage": 10.0,
    "deliveryFee": 5.00,
    "numberOfFriends": 3,
    "instaPayURL": "https://instapay.com/pay/123",
    "billImage": "/uploads/bill-1234567890.jpg",
    "friends": [
      {
        "id": "friend-id",
        "name": "John Doe",
        "products": [
          {
            "productName": "Pizza",
            "unitPrice": 25.00,
            "quantity": 2
          }
        ],
        "paymentMethod": false,
        "subtotal": 50.00,
        "taxAmount": 7.50,
        "serviceAmount": 5.00,
        "deliveryShare": 1.67,
        "totalAmount": 64.17,
        "hasPaid": false,
        "joinedAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 3. Add Friend to Session
**POST** `/sessions/:id/friends`

Add a friend to an existing session.

**Request Body:**
```json
{
  "name": "John Doe",
  "products": [
    {
      "productName": "Pizza",
      "unitPrice": 25.00,
      "quantity": 2
    },
    {
      "productName": "Coke",
      "unitPrice": 3.00,
      "quantity": 1
    }
  ],
  "paymentMethod": false
}
```

**Response:**
```json
{
  "message": "Friend added successfully",
  "friend": {
    "id": "friend-id",
    "name": "John Doe",
    "products": [...],
    "paymentMethod": false,
    "subtotal": 53.00,
    "taxAmount": 7.95,
    "serviceAmount": 5.30,
    "deliveryShare": 1.67,
    "totalAmount": 67.92,
    "hasPaid": false
  }
}
```

### 4. Get Session Summary
**GET** `/sessions/:id/summary`

Get a comprehensive summary of the session.

**Response:**
```json
{
  "summary": {
    "sessionId": "uuid-string",
    "totalOrderAmount": 150.00,
    "totalPaidInstaPay": 45.00,
    "totalPaidCash": 22.92,
    "totalUnpaid": 67.92,
    "friendsCount": 2,
    "expectedFriendsCount": 3,
    "friends": [
      {
        "id": "friend-id",
        "name": "John Doe",
        "products": [...],
        "subtotal": 53.00,
        "taxAmount": 7.95,
        "serviceAmount": 5.30,
        "deliveryShare": 1.67,
        "totalAmount": 67.92,
        "paymentMethod": "Cash",
        "hasPaid": false,
        "joinedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

### 5. Update Payment Status
**PATCH** `/sessions/:id/friends/:friendId/payment`

Update a friend's payment status.

**Request Body:**
```json
{
  "hasPaid": true
}
```

**Response:**
```json
{
  "message": "Payment status updated successfully",
  "friend": {
    "id": "friend-id",
    "name": "John Doe",
    "totalAmount": 67.92,
    "paymentMethod": "Cash",
    "hasPaid": true
  }
}
```

### 6. Delete Session
**DELETE** `/sessions/:id`

Soft delete a session (sets isActive to false).

**Response:**
```json
{
  "message": "Session deleted successfully"
}
```

## Calculation Rules

1. **Subtotal**: Sum of (unitPrice × quantity) for all products
2. **Tax Amount**: (subtotal × taxPercentage) / 100
3. **Service Amount**: (subtotal × servicePercentage) / 100
4. **Delivery Share**: deliveryFee / numberOfFriends
5. **Total Amount**: subtotal + taxAmount + serviceAmount + deliveryShare

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation errors)
- `404`: Not Found
- `500`: Internal Server Error

## File Upload

- Supported formats: All image types (JPEG, PNG, GIF, WebP, etc.)
- Maximum file size: 5MB
- Files are stored in the `uploads` directory
- Files are served at `/uploads/filename`

## Validation Rules

### Session Creation
- `totalOrderAmount`: Positive number
- `taxPercentage`: 0-100
- `servicePercentage`: 0-100
- `deliveryFee`: Positive number
- `numberOfFriends`: Integer ≥ 1
- `instaPayURL`: Valid URL
- `billImage`: Required image file

### Friend Addition
- `name`: 1-100 characters
- `products`: Array with at least one product
- `productName`: 1-200 characters
- `unitPrice`: Positive number
- `quantity`: Integer ≥ 1
- `paymentMethod`: Boolean

## Development

### Project Structure
```
order-splitter-backend/
├── controllers/
│   └── sessionController.js
├── middleware/
│   ├── upload.js
│   └── validation.js
├── models/
│   └── Session.js
├── routes/
│   └── sessionRoutes.js
├── uploads/
├── .env
├── env.example
├── package.json
├── README.md
└── server.js
```

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the ISC License.
