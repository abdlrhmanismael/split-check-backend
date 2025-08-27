# Order Splitter API - Quick Reference

## Base URL
```
http://localhost:3000/api
```

## Endpoints

### 1. Health Check
```
GET /health
```

### 2. Create Session
```
POST /sessions
Content-Type: multipart/form-data

Fields:
- totalOrderAmount (number, required)
- taxPercentage (number, required, 0-100)
- servicePercentage (number, required, 0-100)
- deliveryFee (number, required)
- numberOfFriends (number, required, ≥1)
- instaPayURL (string, required, valid URL)
- billImage (file, required, image)
```

### 3. Get Session Details
```
GET /sessions/:id
```

### 4. Add Friend
```
POST /sessions/:id/friends
Content-Type: application/json

{
  "name": "John Doe",
  "products": [
    {
      "productName": "Pizza",
      "unitPrice": 25.00,
      "quantity": 2
    }
  ],
  "paymentMethod": false
}
```

### 5. Get Session Summary
```
GET /sessions/:id/summary
```

### 6. Update Payment Status
```
PATCH /sessions/:id/friends/:friendId/payment
Content-Type: application/json

{
  "hasPaid": true
}
```

### 7. Delete Session
```
DELETE /sessions/:id
```

## Calculation Formula

```
subtotal = sum(unitPrice × quantity)
taxAmount = (subtotal × taxPercentage) / 100
serviceAmount = (subtotal × servicePercentage) / 100
deliveryShare = deliveryFee / numberOfFriends
totalAmount = subtotal + taxAmount + serviceAmount + deliveryShare
```

## Example Usage with cURL

### Create Session
```bash
curl -X POST http://localhost:3000/api/sessions \
  -F "totalOrderAmount=150.00" \
  -F "taxPercentage=15.0" \
  -F "servicePercentage=10.0" \
  -F "deliveryFee=5.00" \
  -F "numberOfFriends=3" \
  -F "instaPayURL=https://instapay.com/pay/123" \
  -F "billImage=@/path/to/bill.jpg"
```

### Add Friend
```bash
curl -X POST http://localhost:3000/api/sessions/SESSION_ID/friends \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "products": [
      {
        "productName": "Pizza",
        "unitPrice": 25.00,
        "quantity": 2
      }
    ],
    "paymentMethod": false
  }'
```

### Get Summary
```bash
curl http://localhost:3000/api/sessions/SESSION_ID/summary
```

## Response Format

### Success Response
```json
{
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional details"
}
```

## Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `404`: Not Found
- `500`: Internal Server Error

