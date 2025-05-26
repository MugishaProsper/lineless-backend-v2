# Lineless Queue Management System - Backend

A robust backend system for managing virtual queues, built with Node.js, Express, and MongoDB.

## Features

- User authentication and authorization
- Real-time queue management
- Business analytics and reporting
- Rating system
- API key management for businesses
- WebSocket support for real-time updates

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/lineless-backend.git
cd lineless-backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment variables:
```bash
cp .env.example .env
```
Edit the `.env` file with your configuration.

4. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/validate` - Validate authentication token
- `POST /api/auth/logout` - User logout

### Queue Management

- `GET /api/queues/user/:userId` - Get user's queues
- `GET /api/queues/business/:businessId` - Get business queue
- `POST /api/queues/join` - Join a queue
- `DELETE /api/queues/:queueId` - Leave a queue
- `POST /api/queues/business/:businessId/call-next` - Call next customer

### Business Management

- `GET /api/business/:businessId/api-key` - Get business API key
- `POST /api/business/:businessId/api-key/regenerate` - Regenerate API key
- `GET /api/business/:businessId/analytics` - Get business analytics
- `GET /api/business/:businessId/info` - Get business information

### User Management

- `GET /api/users/:userId/history` - Get user queue history
- `PUT /api/users/:userId/profile` - Update user profile
- `DELETE /api/users/:userId` - Delete user account

### Rating System

- `POST /api/ratings` - Submit a rating
- `GET /api/ratings/business/:businessId` - Get business ratings
- `GET /api/ratings/user/:userId` - Get user ratings

## WebSocket Events

The system uses Socket.IO for real-time updates. Available events:

- `join-queue` - Join a queue room
- `leave-queue` - Leave a queue room
- `queue-update` - Queue status updates

## Testing

Run the test suite:
```bash
npm test
```

## Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers

## Error Handling

The API uses a consistent error response format:
```json
{
  "success": false,
  "message": "Error message"
}
```

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 
