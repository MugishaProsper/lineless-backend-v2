import express from 'express';
import { auth, authorize } from '../middlewares/auth.middleware.js';
import {
  createService,
  getServices,
  getServiceById,
  updateService,
  deleteService,
  getServiceAnalytics
} from '../controllers/service.controller.js';

const service_router = express.Router();

// Routes
service_router.post('/', auth, authorize('business'), createService);
service_router.get('/', auth, authorize('business'), getServices);
service_router.get('/:id', auth, authorize('business'), getServiceById);
service_router.put('/:id', auth, authorize('business'), updateService);
service_router.delete('/:id', auth, authorize('business'), deleteService);
service_router.get('/analytics', auth, authorize('business'), getServiceAnalytics);

export default service_router;
