import Service from "../models/service.model.js";

export const createService = async (req, res) => {
  const { serviceName, serviceDescription, startDate, endDate } = req.body;
  const userId = req.user._id;
  try {
    const service = new Service({
      businessId: userId,
      serviceName,
      serviceDescription,
      startTime: startDate,
      endTime: endDate
    });
    
    await service.save();
    return res.status(201).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const getServices = async (req, res) => {
  try {
    const services = await Service.find({ businessId: req.user._id })
      .populate('queueMembers');
    
    return res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const getServiceById = async (req, res) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      businessId: req.user._id
    }).populate('queueMembers');
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const updateService = async (req, res) => {
  const { serviceName, serviceDescription, startDate, endDate, status } = req.body;
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
    
    if (serviceName) service.serviceName = serviceName;
    if (serviceDescription) service.serviceDescription = serviceDescription;
    if (startDate) service.startTime = startDate;
    if (endDate) service.endTime = endDate;
    if (status) await service.updateStatus(status);
    
    await service.save();
    
    return res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const deleteService = async (req, res) => {
  try {
    const service = await Service.findOneAndDelete({
      _id: req.params.id,
      businessId: req.user._id
    });
    
    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found"
      });
    }
    
    return res.status(200).json({
      success: true,
      message: "Service deleted successfully"
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};

export const getServiceAnalytics = async (req, res) => {
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
    
    const analytics = await service.getAnalytics();
    
    return res.status(200).json({
      success: true,
      data: analytics
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server error" });
  }
};