import express from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import { login, signup, validateToken, logout } from '../controllers/auth.controller.js';

const auth_router = express.Router();

// Routes
auth_router.post('/login', login);
auth_router.post('/register', signup);
auth_router.get('/validate', validateToken);
auth_router.post('/logout', auth, logout);

export default auth_router;