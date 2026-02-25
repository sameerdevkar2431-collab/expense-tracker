# API Documentation

## Base URL
```
https://your-app.vercel.app/api
```

## Error Responses

All API errors follow this format:
```json
{
  "error": "Error message describing what went wrong"
}
```

HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing/invalid fields)
- `401` - Unauthorized (not authenticated)
- `500` - Internal Server Error

## Endpoints

### GET /health
Health check endpoint.

**No authentication required**

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": 3600
}
```

**Example:**
```bash
curl https://your-app.vercel.app/api/health
```

---

### GET /auth/me
Get current authenticated user info.

**Authentication:** Required (Supabase session)

**Response:**
```json
{
  "user": {
    "id": "user-uuid",
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Example:**
```bash
curl -H "Cookie: sb-access-token=your-token" \
  https://your-app.vercel.app/api/auth/me
```

---

### GET /transactions
Get user's transactions.

**Authentication:** Required

**Query Parameters:**
- `month` (optional): Filter by month (YYYY-MM)
- `type` (optional): Filter by type (expense, income)

**Response:**
```json
{
  "transactions": [
    {
      "id": "transaction-id",
      "amount": 500,
      "category": "Food",
      "description": "Grocery shopping",
      "date": "2024-01-15",
      "type": "expense"
    }
  ]
}
```

**Example:**
```bash
curl -H "Cookie: sb-access-token=your-token" \
  https://your-app.vercel.app/api/transactions
```

---

### POST /transactions
Create new transaction.

**Authentication:** Required

**Request Body:**
```json
{
  "amount": 500,
  "category": "Food",
  "description": "Grocery shopping",
  "date": "2024-01-15",
  "type": "expense"
}
```

**Response:**
```json
{
  "transaction": {
    "id": "transaction-id",
    "amount": 500,
    "category": "Food",
    "description": "Grocery shopping",
    "date": "2024-01-15",
    "type": "expense"
  }
}
```

**Example:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=your-token" \
  -d '{
    "amount": 500,
    "category": "Food",
    "description": "Grocery shopping",
    "date": "2024-01-15",
    "type": "expense"
  }' \
  https://your-app.vercel.app/api/transactions
```

---

### POST /receipts/upload
Upload receipt image to Supabase Storage.

**Authentication:** Required

**Request:** multipart/form-data
- `file`: Image file (jpg, png, webp, etc.)

**Response:**
```json
{
  "success": true,
  "url": "https://supabase-url.supabase.co/storage/v1/object/public/receipts/...",
  "fileName": "user-id/1234567-uuid-filename.jpg"
}
```

**Example:**
```bash
curl -X POST \
  -H "Cookie: sb-access-token=your-token" \
  -F "file=@receipt.jpg" \
  https://your-app.vercel.app/api/receipts/upload
```

---

### POST /receipts/analyze
Analyze receipt image using OpenAI Vision API.

**Authentication:** Required

**Request Body:**
```json
{
  "imageUrl": "https://supabase-url.supabase.co/storage/v1/object/public/receipts/..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "merchant": "Starbucks",
    "date": "2024-01-15",
    "items": [
      {"name": "Café Latte", "price": 150}
    ],
    "total": 253,
    "tax": 23
  },
  "confidence": 0.9
}
```

**Example:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: sb-access-token=your-token" \
  -d '{
    "imageUrl": "https://supabase-url.supabase.co/storage/..."
  }' \
  https://your-app.vercel.app/api/receipts/analyze
```

## Rate Limits

Currently no rate limiting is enforced. In production, implement rate limiting using Upstash Redis to prevent abuse:
- Transactions: 100 requests per minute
- Receipts upload: 30 requests per minute
- Receipts analyze: 20 requests per minute

## Authentication

All user-facing endpoints require Supabase authentication. The session is automatically managed via cookies through the middleware in `middleware.ts`.

When making requests from client-side code, cookies are automatically included. For server-to-server requests or testing with curl, include the `Cookie` header with the Supabase session token.
