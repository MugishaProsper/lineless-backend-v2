import User from "../models/user.model.js";
import Queue from "../models/queue.model.js";

export const updateProfile = async (req, res) => {
  try {
    const { name, email, phoneNumber } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (phoneNumber) user.phoneNumber = phoneNumber;

    await user.save();

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect"
      });
    }

    user.password = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const getUserQueues = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all queues where the user is a member
    const queues = await Queue.find({ members: userId })
      .populate('serviceId', 'serviceName serviceDescription')
      .populate('businessId', 'name email phoneNumber');
    
    return res.status(200).json({
      success: true,
      data: queues
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const getActiveUserQueues = async (req, res) => {
  try {
    const userId = req.user._id;
    
    // Find all active queues where the user is a member
    const queues = await Queue.find({ 
      members: userId,
      status: "active"
    })
      .populate('serviceId', 'serviceName serviceDescription')
      .populate('businessId', 'name email phoneNumber');
    
    return res.status(200).json({
      success: true,
      data: queues
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};
