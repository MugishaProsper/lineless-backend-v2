import express from 'express';
import { auth } from '../middlewares/auth.middleware.js';
import { login, signup, validateToken, logout } from '../controllers/auth.controller.js';
import { body } from 'express-validator';

const auth_router = express.Router();

// Validation middleware
const loginValidation = [
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
];

const signupValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['USER', 'BUSINESS'])
    .withMessage('Role must be either USER or BUSINESS')
];

// Routes
auth_router.post('/login', loginValidation, login);
auth_router.post('/register', signupValidation, signup);
auth_router.get('/validate', validateToken);
auth_router.post('/logout', auth, logout);

export default auth_router;