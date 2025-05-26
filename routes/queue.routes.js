import express from 'express';
import { body } from 'express-validator';
import { auth, authorize } from '../middlewares/auth.middleware.js';
import {
  getUserQueues,
  getBusinessQueue,
  joinQueue,
  leaveQueue,
  callNext
} from '../controllers/queue.controller.js';

const queue_router = express.Router();

// Validation middleware
const joinQueueValidation = [
  body('businessId').isMongoId().withMessage('Invalid business ID'),
  body('service').trim().notEmpty().withMessage('Service is required')
];

// Routes
queue_router.get('/user/:userId', auth, getUserQueues);
queue_router.get('/business/:businessId', auth, authorize('business'), getBusinessQueue);
queue_router.post('/join', auth, authorize('user'), joinQueueValidation, joinQueue);
queue_router.delete('/:queueId', auth, leaveQueue);
queue_router.post('/business/:businessId/call-next', auth, authorize('business'), callNext);

export default queue_router;