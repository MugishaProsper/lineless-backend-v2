import express from 'express';
import { auth, authorize } from '../middlewares/auth.middleware.js';
import {
  getUserQueues,
  updateProfile,
  deleteAccount
} from '../controllers/user.controller.js';

const user_router = express.Router();

// Routes
user_router.get('/:userId/history', auth, authorize('user'), getUserQueues);
user_router.put('/:userId/profile', auth, updateProfile);
user_router.delete('/:userId', auth, deleteAccount);

export default user_router;