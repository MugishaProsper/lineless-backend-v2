import Queue from "../models/queue.model.js";
import User from "../models/user.model.js";

export const getUserQueues = async (req, res) => {
  try {
    const queues = await Queue.find({ customerId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('businessId', 'name');

    res.json({
      success: true,
      queues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching queues'
    });
  }
};

export const getBusinessQueue = async (req, res) => {
  try {
    const queues = await Queue.getActiveQueues(req.user._id);
    res.json({
      success: true,
      queues
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching business queue'
    });
  }
};

export const joinQueue = async (req, res) => {
  try {
    const { businessId, service } = req.body;

    const business = await User.findOne({ _id: businessId, role: 'business' });
    if (!business) {
      return res.status(404).json({
        success: false,
        message: 'Business not found'
      });
    }

    const existingQueue = await Queue.getCustomerActiveQueue(req.user._id);
    if (existingQueue) {
      return res.status(400).json({
        success: false,
        message: 'You are already in a queue'
      });
    }

    // Calculate position and estimated wait time
    const activeQueues = await Queue.getActiveQueues(businessId);
    const position = activeQueues.length + 1;
    const estimatedWait = position * 15;

    const queue = new Queue({
      businessId,
      customerId: req.user._id,
      customerName: req.user.name,
      service,
      position,
      estimatedWait
    });

    await queue.save();

    // Emit socket event for real-time updates
    req.app.get('io').to(`queue-${businessId}`).emit('queue-update', {
      type: 'join',
      queue
    });

    return res.status(201).json({
      success: true,
      queue
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error joining queue'
    });
  }
};

export const leaveQueue = async (req, res) => {
  try {
    const queue = await Queue.findOne({
      _id: req.params.queueId,
      customerId: req.user._id
    });

    if (!queue) {
      return res.status(404).json({
        success: false,
        message: 'Queue not found'
      });
    }

    await queue.remove();

    // Emit socket event for real-time updates
    req.app.get('io').to(`queue-${queue.businessId}`).emit('queue-update', {
      type: 'leave',
      queueId: queue._id
    });

    return res.status(200).json({
      success: true,
      message: 'Left queue successfully'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error leaving queue'
    });
  }
};

export const callNext = async (req, res) => {
  try {
    const nextCustomer = await Queue.findOne({
      businessId: req.user._id,
      status: 'waiting'
    }).sort({ createdAt: 1 });

    if (!nextCustomer) {
      return res.json({
        success: true,
        nextCustomer: null
      });
    }

    nextCustomer.status = 'called';
    await nextCustomer.save();

    // Emit socket event for real-time updates
    req.app.get('io').to(`queue-${req.user._id}`).emit('queue-update', {
      type: 'call-next',
      queue: nextCustomer
    });

    return res.status(200).json({
      success: true,
      nextCustomer
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error calling next customer'
    });
  }
};
