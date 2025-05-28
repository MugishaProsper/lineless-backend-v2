import express from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import { login, signup, validateToken, logout } from '../controllers/auth.controller.js';
import { body } from 'express-validator';

const auth_router = express.Router();

// Routes
auth_router.post('/login', loginValidation, login);
auth_router.post('/register', signupValidation, signup);
auth_router.get('/validate', validateToken);
auth_router.post('/logout', auth, logout);

export default auth_router;