# Sovereon Inc. Backend API

A lightweight, production-ready backend API optimized for free tier hosting.

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn

### Setup (5 minutes)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env.local

# 3. Generate Prisma client
npx prisma generate

# 4. Create database and migrate
npx prisma migrate dev --name init

# 5. Seed database with demo data
npm run seed

# 6. Start development server
npm run dev
```

Server will be available at: `http://localhost:5000`

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication
All protected endpoints require JWT token in header:
```
Authorization: Bearer {token}
```

### Health Check
```
GET /api/health
```

## 🔐 Authentication Endpoints

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}

Response:
{
  "success": true,
  "data": {
    "user": { "id": "...", "email": "...", "role": "user" },
    "token": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response: Same as register
```

### Get Current User
```
GET /api/auth/me
Authorization: Bearer {token}
```

### Update Profile
```
PUT /api/auth/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "companyName": "ACME Corp",
  "phone": "+1234567890"
}
```

## 🛍️ Services Endpoints

### List All Services
```
GET /api/services
```

### Get Service by Slug
```
GET /api/services/{slug}
```

## 📦 Orders Endpoints

### List User's Orders
```
GET /api/orders
Authorization: Bearer {token}
```

### Create Order
```
POST /api/orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "serviceId": "service-uuid",
  "quantity": 1,
  "totalAmount": 2999
}
```

### Get Order Details
```
GET /api/orders/{id}
Authorization: Bearer {token}
```

## 💳 Invoices Endpoints

### List Invoices
```
GET /api/invoices
Authorization: Bearer {token}
```

### Create Invoice
```
POST /api/invoices
Authorization: Bearer {token}
Content-Type: application/json

{
  "orderId": "order-uuid",
  "amount": 2999,
  "tax": 300
}
```

### Get Invoice Details
```
GET /api/invoices/{id}
Authorization: Bearer {token}
```

## 🔄 Subscriptions Endpoints

### List Subscriptions
```
GET /api/subscriptions
Authorization: Bearer {token}
```

### Create Subscription
```
POST /api/subscriptions
Authorization: Bearer {token}
Content-Type: application/json

{
  "serviceId": "service-uuid",
  "planName": "Professional",
  "price": 999,
  "billingCycle": "monthly"
}
```

### Cancel Subscription
```
POST /api/subscriptions/{id}/cancel
Authorization: Bearer {token}
```

## 💰 Payments Endpoints

### List Payments
```
GET /api/payments
Authorization: Bearer {token}
```

### Create Payment
```
POST /api/payments
Authorization: Bearer {token}
Content-Type: application/json

{
  "invoiceId": "invoice-uuid",
  "amount": 3299,
  "paymentMethod": "credit_card"
}
```

### Get Payment Details
```
GET /api/payments/{id}
Authorization: Bearer {token}
```

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── app.ts                 # Express app setup
│   ├── middleware/            # Middleware (auth, error handling)
│   ├── routes/               # Route handlers
│   ├── services/             # Business logic
│   ├── utils/                # Utilities (JWT, errors)
│   └── database/             # Database config & seeding
├── prisma/
│   └── schema.prisma         # Database schema
├── dist/                     # Compiled output
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🗄️ Database

This backend uses SQLite by default (perfect for development and free tier).

### Switch to PostgreSQL (optional)

For production, update `.env`:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

Then update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

Then run: `npx prisma migrate deploy`

## 📝 Demo Credentials

Credentials created during seeding:

**Admin User:**
- Email: `admin@sovereon.com`
- Password: `admin123`

**Demo User:**
- Email: `demo@sovereon.com`
- Password: `demo123`

## 🚀 Deployment

### Deploy to Render (Free)

1. Push code to GitHub
2. Go to https://render.com
3. Create new Web Service from GitHub repo
4. Set environment variables:
   ```
   DATABASE_URL=[your-database-url]
   JWT_SECRET=[strong-random-secret]
   NODE_ENV=production
   FRONTEND_URL=[your-frontend-url]
   ```
5. Deploy!

### Deploy to Railway (Free Credits)

1. Go to https://railway.app
2. Create new project from GitHub
3. Add PostgreSQL addon
4. Set environment variables
5. Deploy!

### Deploy to Vercel (Node.js)

1. Push to GitHub
2. Import to Vercel
3. Set environment variables
4. Deploy!

## 📚 Commands

```bash
# Development
npm run dev              # Start dev server with hot reload
npm run build            # Build for production
npm start                # Start production server

# Database
npm run migrate          # Run migrations in dev
npm run migrate:prod     # Run migrations in production
npm run generate         # Generate Prisma client
npm run seed             # Seed database with demo data
```

## 🔒 Security Notes

- Passwords are hashed with bcryptjs (12 rounds)
- JWT tokens expire after 15 minutes
- Refresh tokens expire after 7 days
- All endpoints validate input with Zod
- CORS configured for frontend origin
- Use strong JWT_SECRET in production

## 🤝 Integration with Frontend

Update frontend `.env`:
```
VITE_API_URL=http://localhost:5000/api
```

Example API call:
```typescript
const response = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { data } = await response.json();
localStorage.setItem('auth_token', data.token);
```

## 📊 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict (e.g., email exists)
- `500` - Server Error

## 🐛 Troubleshooting

### Port already in use
```bash
PORT=5001 npm run dev
```

### Database locked
```bash
rm app.db
npx prisma migrate dev
```

### Module not found
```bash
npm install
npx prisma generate
```

## 💡 Tips

- Use Postman or Thunder Client for API testing
- Check logs for detailed error messages
- Keep `.env` file private (never commit)
- Use `.env.example` as a template
- Test locally before deploying

## 📄 License

MIT

## 👥 Support

For issues or questions, check the API documentation or create an issue on GitHub.
