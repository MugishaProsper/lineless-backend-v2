import  express from 'express';
import { auth, authorize } from '../middlewares/auth.middleware.js';
import {
  getApiKey,
  regenerateApiKey,
  getAnalytics,
  getBusinessInfo
} from '../controllers/business.controller.js';

const business_router = express.Router();

// All routes require business role
business_router.use(auth, authorize('business'));

// Routes
business_router.get('/:businessId/api-key', getApiKey);
business_router.post('/:businessId/api-key/regenerate', regenerateApiKey);
business_router.get('/:businessId/analytics', getAnalytics);
business_router.get('/:businessId/info', getBusinessInfo);

export default business_router