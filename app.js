import { configDotenv } from 'dotenv';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http'
import { Server } from 'socket.io';

configDotenv();

import auth_router from './routes/auth.routes.js';
import queue_router from './routes/queue.routes.js';
import business_router from './routes/business.routes.js'
import user_router from './routes/user.routes.js'
import rating_router from './routes/rating.routes.js'
import service_router from './routes/service.routes.js';
import { connectToDB } from './config/db.config.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api/auth', auth_router);
app.use('/api/queue', queue_router);
app.use('/api/business', business_router);
app.use('/api/users', user_router);
app.use('/api/ratings', rating_router);
app.use('/api/services', service_router);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join-queue', (data) => {
    socket.join(`queue-${data.businessId}`);
  });

  socket.on('leave-queue', (data) => {
    socket.leave(`queue-${data.businessId}`);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});


// Start server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  connectToDB();
}); 