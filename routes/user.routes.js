import express from 'express';
import { body } from 'express-validator';
import { auth, authorize } from '../middlewares/auth.middleware.js';
import {
  getUserHistory,
  updateProfile,
  deleteAccount
} from '../controllers/user.controller.js';

const user_router = express.Router();

// Validation middleware
const updateProfileValidation = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().withMessage('Please enter a valid email'),
  body('phoneNumber').optional().trim(),
  body('notificationPreferences').optional().isObject()
];

// Routes
user_router.get('/:userId/history', auth, authorize('user'), getUserHistory);
user_router.put('/:userId/profile', auth, updateProfileValidation, updateProfile);
user_router.delete('/:userId', auth, deleteAccount);

export default user_router;