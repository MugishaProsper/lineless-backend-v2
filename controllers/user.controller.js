import User from "../models/user.model.js";
import Queue from "../models/queue.model.js";
import Rating from "../models/rating.model.js";

export const getUserHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const queues = await Queue.find({
      customerId: req.user._id,
      status: { $in: ['completed', 'cancelled'] }
    })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('businessId', 'name');

    const total = await Queue.countDocuments({
      customerId: req.user._id,
      status: { $in: ['completed', 'cancelled'] }
    });

    return res.json({
      success: true,
      history: queues,
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
      message: 'Error fetching user history'
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber, notificationPreferences } = req.body;

    // Check if email is already taken by another user
    if (email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken'
        });
      }
    }

    const updates = {
      name,
      email,
      phoneNumber,
      notificationPreferences
    };

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        req.user[key] = updates[key];
      }
    });

    await req.user.save();

    return res.status(200).json({
      success: true,
      user: req.user.getPublicProfile()
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating profile'
    });
  }
};

export const deleteAccount = async (req, res) => {
  try {
    // Delete user's queues
    await Queue.deleteMany({ customerId: req.user._id });

    // Delete user's ratings
    await Rating.deleteMany({ userId: req.user._id });

    // Delete user account
    await req.user.remove();

    res.clearCookie('token');
    return res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting account'
    });
  }
};
