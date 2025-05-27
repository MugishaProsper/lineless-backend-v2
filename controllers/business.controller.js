import User from '../models/user.model.js';
import Queue from '../models/queue.model.js';
import Rating from '../models/rating.model.js';
import { generateApiKey } from '../utils/generate.api_key.js';

export const getApiKey = async (req, res) => {
  try {
    const business = await User.findOne({ _id: req.user._id, role: 'business' });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    return res.status(200).json({
      success: true,
      apiKey: business.apiKey
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching API key'
    });
  }
};

export const regenerateApiKey = async (req, res) => {
  try {
    const business = await User.findOne({ _id: req.user._id, role: 'business' });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    business.apiKey = generateApiKey();
    await business.save();

    return res.status(200).json({
      success: true,
      apiKey: business.apiKey
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error regenerating API key'
    });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const businessId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get total customers today
    const totalCustomersToday = await Queue.countDocuments({
      businessId,
      createdAt: { $gte: today }
    });

    // Get average wait time
    const completedQueues = await Queue.find({
      businessId,
      status: 'completed',
      createdAt: { $gte: today }
    });

    const averageWaitTime = completedQueues.length > 0
      ? completedQueues.reduce((acc, queue) => acc + queue.estimatedWait, 0) / completedQueues.length
      : 0;

    // Get peak hours
    const peakHours = await Queue.aggregate([
      {
        $match: {
          businessId: businessId,
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          hour: '$_id',
          count: 1,
          _id: 0
        }
      },
      {
        $sort: { hour: 1 }
      }
    ]);

    // Get service breakdown
    const serviceBreakdown = await Queue.aggregate([
      {
        $match: {
          businessId: businessId,
          createdAt: { $gte: today }
        }
      },
      {
        $group: {
          _id: '$service',
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          service: '$_id',
          count: 1,
          _id: 0
        }
      }
    ]);

    // Get daily stats for the last 7 days
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyStats = await Queue.aggregate([
      {
        $match: {
          businessId: businessId,
          createdAt: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
          },
          customers: { $sum: 1 },
          waitTime: { $avg: '$estimatedWait' }
        }
      },
      {
        $project: {
          date: '$_id',
          customers: 1,
          waitTime: 1,
          _id: 0
        }
      },
      {
        $sort: { date: 1 }
      }
    ]);

    return res.status(200).json({
      success: true,
      analytics: {
        totalCustomersToday,
        averageWaitTime,
        peakHours,
        serviceBreakdown,
        dailyStats
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching analytics'
    });
  }
};

export const getBusinessInfo = async (req, res) => {
  try {
    const business = await User.findOne({ _id: req.user._id, role: 'business' });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const { averageRating, totalRatings } = await Rating.getBusinessAverageRating(req.user._id);

    return res.status(200).json({
      success: true,
      business: {
        ...business.getPublicProfile(),
        averageRating,
        totalRatings
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching business info'
    });
  }
};

export const createQueue = async (req, res) => {
  try {
    const { service, estimatedWaitTime, maxCapacity } = req.body;
    const businessId = req.user._id;

    // Validate input
    if (!service || !estimatedWaitTime) {
      return res.status(400).json({
        success: false,
        message: 'Service and estimated wait time are required'
      });
    }

    // Check if business exists
    const business = await User.findOne({ _id: businessId, role: 'business' });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    // Create new queue
    const queue = new Queue({
      businessId,
      service,
      estimatedWait: estimatedWaitTime,
      maxCapacity: maxCapacity || null,
      status: 'active'
    });

    await queue.save();

    // Emit socket event for real-time updates
    req.app.get('io').to(`business-${businessId}`).emit('queue-created', {
      queue
    });

    return res.status(201).json({
      success: true,
      queue
    });
  } catch (error) {
    console.error('Create queue error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error creating queue'
    });
  }
};

export const updateQueue = async (req, res) => {
  try {
    const { queueId } = req.params;
    const { service, estimatedWaitTime, maxCapacity, status } = req.body;
    const businessId = req.user._id;

    // Find queue
    const queue = await Queue.findOne({
      _id: queueId,
      businessId
    });

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }

    // Update queue fields
    if (service) queue.service = service;
    if (estimatedWaitTime) queue.estimatedWait = estimatedWaitTime;
    if (maxCapacity !== undefined) queue.maxCapacity = maxCapacity;
    if (status) queue.status = status;

    await queue.save();

    // Emit socket event for real-time updates
    req.app.get('io').to(`business-${businessId}`).emit('queue-updated', {
      queue
    });

    return res.status(200).json({
      success: true,
      queue
    });
  } catch (error) {
    console.error('Update queue error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error updating queue'
    });
  }
};

export const deleteQueue = async (req, res) => {
  try {
    const { queueId } = req.params;
    const businessId = req.user._id;

    const queue = await Queue.findOne({
      _id: queueId,
      businessId
    });

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }

    await queue.remove();

    // Emit socket event for real-time updates
    req.app.get('io').to(`business-${businessId}`).emit('queue-deleted', {
      queueId
    });

    return res.status(200).json({
      success: true,
      message: 'Queue deleted successfully'
    });
  } catch (error) {
    console.error('Delete queue error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error deleting queue'
    });
  }
};

export const getBusinessQueues = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { status } = req.query;

    const query = { businessId };
    if (status) {
      query.status = status;
    }

    const queues = await Queue.find(query)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      queues
    });
  } catch (error) {
    console.error('Get business queues error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error fetching business queues'
    });
  }
};