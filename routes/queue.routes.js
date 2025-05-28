import express from 'express';
import { auth, authorize } from '../middlewares/auth.middleware.js';
import {
  addQueueToService,
  removeQueueFromService,
  getServiceQueues,
  getQueueCount
} from '../controllers/queue.controller.js';

const queue_router = express.Router();

// Add queue to a service
queue_router.post('/service/:id/queue', auth, authorize('business'), addQueueToService);

// Remove queue from a service
queue_router.delete('/service/:id/queue/:queueId', auth, authorize('business'), removeQueueFromService);

// Get all queues for a service
queue_router.get('/service/:id/queues', auth, authorize('business'), getServiceQueues);

// Get queue count for a service
queue_router.get('/service/:id/queue/count', auth, authorize('business'), getQueueCount);

export default queue_router;
