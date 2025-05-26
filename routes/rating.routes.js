import express from 'express';
import { body } from 'express-validator';
import { auth, authorize } from '../middlewares/auth.middleware.js';
import {
  submitRating,
  getBusinessRatings,
  getUserRatings
} from '../controllers/rating.controller.js';

const rating_router = express.Router();

// Validation middleware
const ratingValidation = [
  body('businessId').isMongoId().withMessage('Invalid business ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').optional().trim()
];

// Routes
rating_router.post('/', auth, authorize('user'), ratingValidation, submitRating);
rating_router.get('/business/:businessId', getBusinessRatings);
rating_router.get('/user/:userId', auth, authorize('user'), getUserRatings);

export default rating_router;