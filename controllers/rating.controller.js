import Rating from "../models/rating.model.js";
import Queue from "../models/queue.model.js";

export const submitRating = async (req, res) => {
  try {
    const { businessId, rating, comment } = req.body;

    // Check if user has completed a queue with this business
    const completedQueue = await Queue.findOne({
      customerId: req.user._id,
      businessId,
      status: 'completed'
    });

    if (!completedQueue) {
      return res.status(400).json({
        success: false,
        message: 'You can only rate businesses you have visited'
      });
    }

    // Check if user has already rated this business
    const existingRating = await Rating.findOne({
      userId: req.user._id,
      businessId
    });

    if (existingRating) {
      return res.status(400).json({
        success: false,
        message: 'You have already rated this business'
      });
    }

    const newRating = new Rating({
      userId: req.user._id,
      businessId,
      rating,
      comment
    });

    await newRating.save();

    return res.status(201).json({
      success: true,
      rating: newRating
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error submitting rating'
    });
  }
};

export const getBusinessRatings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const ratings = await Rating.getBusinessRatings(req.params.businessId, page, limit);
    const total = await Rating.countDocuments({ businessId: req.params.businessId });

    return res.json({
      success: true,
      ratings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching business ratings'
    });
  }
};

export const getUserRatings = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const ratings = await Rating.getUserRatings(req.user._id, page, limit);
    const total = await Rating.countDocuments({ userId: req.user._id });

    return res.json({
      success: true,
      ratings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching user ratings'
    });
  }
};