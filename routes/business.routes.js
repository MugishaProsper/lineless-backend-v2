import express from 'express';
import { auth, authorize } from '../middlewares/auth.middleware.js';
import {
  getApiKey,
  regenerateApiKey,
  getAnalytics,
  getBusinessInfo,
  createQueue,
  updateQueue,
  deleteQueue,
  getBusinessQueues
} from '../controllers/business.controller.js';
import { body } from 'express-validator';

const business_router = express.Router();

// All routes require business role
business_router.use(auth, authorize('business'));

const updateQueueValidation = [body('service').optional().trim().notEmpty().withMessage('Service name cannot be empty'),
body('estimatedWaitTime').optional().isInt({ min: 1 }).withMessage('Estimated wait time must be a positive number'),
body('maxCapacity').optional().isInt({ min: 1 }).withMessage('Max capacity must be a positive number'),
body('status').optional().isIn(['active', 'paused', 'closed']).withMessage('Invalid status')]

const createQueueValidation = [body('service').trim().notEmpty().withMessage('Service name is required'),
body('estimatedWaitTime').isInt({ min: 1 }).withMessage('Estimated wait time must be a positive number'),
body('maxCapacity').optional().isInt({ min: 1 }).withMessage('Max capacity must be a positive number')]

// API Key routes
business_router.get('/:businessId/api-key', getApiKey);
business_router.post('/:businessId/api-key/regenerate', regenerateApiKey);

// Analytics routes
business_router.get('/:businessId/analytics', getAnalytics);
business_router.get('/:businessId/info', getBusinessInfo);

// Queue management routes
business_router.post('/queues', createQueueValidation, createQueue);

business_router.get('/queues', getBusinessQueues);

business_router.put('/queues/:queueId', updateQueueValidation, updateQueue);

business_router.delete('/queues/:queueId', deleteQueue);

export default business_router;