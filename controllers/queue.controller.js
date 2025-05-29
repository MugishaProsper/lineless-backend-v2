import Service from "../models/service.model.js";
import Queue from "../models/queue.model.js";

// New methods for queue manipulation
export const addQueueToService = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      businessId: req.user._id
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    const queue = new Queue({
      serviceId: service._id
    });

    await queue.save();
    await service.addQueue(queue._id);

    return res.status(201).json({
      success: true,
      data: queue
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const removeQueueFromService = async (req, res) => {
  try {
    const { queueId } = req.params;
    const service = await Service.findOne({
      _id: req.params.id,
      businessId: req.user._id
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    await service.removeQueue(queueId);
    await Queue.findByIdAndDelete(queueId);

    return res.status(200).json({
      success: true,
      message: "Queue removed successfully"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const getServiceQueues = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      businessId: req.user._id
    }).populate({
      path: 'queueMembers',
      populate: {
        path: 'queueMembers.user',
        select: 'name email'
      }
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: service.queueMembers
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const getQueueCount = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      businessId: req.user._id
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }

    const count = service.getQueueCount();

    return res.status(200).json({
      success: true,
      data: { count }
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};