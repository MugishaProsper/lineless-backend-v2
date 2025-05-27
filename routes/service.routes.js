import express from 'express';
import { auth, authorize } from '../middlewares/auth.middleware.js';
import {
  getBusinessServices,
  createBusinessService,
  updateBusinessService,
  deleteBusinessService,
} from '../controllers/service.controller.js';
import { body } from 'express-validator';

const service_router = express.Router();

// All service routes require business role
service_router.use(auth, authorize('business'));

const createServiceValidation = [
  body('serviceName').trim().notEmpty().withMessage('Service name is required'),
  body('estimatedWaitTime').isInt({ min: 1 }).withMessage('Estimated wait time must be a positive number'),
  body('maxCapacity').optional().isInt({ min: 0 }).withMessage('Max capacity must be a non-negative number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

const updateServiceValidation = [
  body('serviceName').optional().trim().notEmpty().withMessage('Service name cannot be empty'),
  body('estimatedWaitTime').optional().isInt({ min: 1 }).withMessage('Estimated wait time must be a positive number'),
  body('maxCapacity').optional().isInt({ min: 0 }).withMessage('Max capacity must be a non-negative number'),
  body('isActive').optional().isBoolean().withMessage('isActive must be a boolean'),
];

// Service routes
service_router.get('/', getBusinessServices);
service_router.post('/', createServiceValidation, createBusinessService);
service_router.put('/:serviceId', updateServiceValidation, updateBusinessService);
service_router.delete('/:serviceId', deleteBusinessService);

export default service_router; 