import Service from '../models/service.model.js';

// Get all services for a business
export const getBusinessServices = async (req, res) => {
  try {
    const businessId = req.user._id;
    const services = await Service.find({ businessId });
    res.status(200).json({
      success: true,
      services,
    });
  } catch (error) {
    console.error('Error fetching business services:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching business services',
    });
  }
};

// Create a new service for a business
export const createBusinessService = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { serviceName, estimatedWaitTime, maxCapacity, isActive } = req.body;

    const service = new Service({
      businessId,
      serviceName,
      estimatedWaitTime,
      maxCapacity,
      isActive,
    });

    await service.save();

    res.status(201).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error('Error creating business service:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating business service',
    });
  }
};

// Update a service
export const updateBusinessService = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { serviceId } = req.params;
    const updates = req.body;

    const service = await Service.findOneAndUpdate(
      { _id: serviceId, businessId },
      updates,
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or you do not own this service',
      });
    }

    res.status(200).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error('Error updating business service:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating business service',
    });
  }
};

// Delete a service
export const deleteBusinessService = async (req, res) => {
  try {
    const businessId = req.user._id;
    const { serviceId } = req.params;

    const service = await Service.findOneAndDelete({
      _id: serviceId,
      businessId,
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found or you do not own this service',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting business service:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting business service',
    });
  }
}; 