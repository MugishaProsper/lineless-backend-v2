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