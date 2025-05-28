import mongoose from "mongoose";

const serviceSchema = mongoose.Schema({
  businessId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  serviceName: { type: String, required: true },
  serviceDescription: { type: String, required: true },
  queueMembers: [{ type: mongoose.Schema.Types.ObjectId, ref: "Queue" }],
  status: { type: String, enum: ["scheduled", "active", "paused", "finished"], default: "active" },
  startTime: { type: Date, default: Date.now },
  endTime: { type: Date }
}, { timestamps: true });

// Create indexes
serviceSchema.index({ businessId: 1 }); // For querying services by business
serviceSchema.index({ status: 1 }); // For filtering services by status
serviceSchema.index({ startTime: 1 }); // For date-based queries
serviceSchema.index({ businessId: 1, status: 1 }); // Compound index for common queries
serviceSchema.index({ businessId: 1, startTime: 1 }); // For business service history

// Method to add a queue to the service
serviceSchema.methods.addQueue = async function(queueId) {
  if (this.status !== "active") {
    throw new Error('Cannot add queue to a non-active service');
  }
  if (!this.queueMembers.includes(queueId)) {
    this.queueMembers.push(queueId);
    return this.save();
  }
  return this;
};

// Method to remove a queue from the service
serviceSchema.methods.removeQueue = async function(queueId) {
  if (this.status === "finished") {
    throw new Error('Cannot modify queues in a finished service');
  }
  const index = this.queueMembers.indexOf(queueId);
  if (index > -1) {
    this.queueMembers.splice(index, 1);
    return this.save();
  }
  return this;
};

// Method to get all active queues for this service
serviceSchema.methods.getActiveQueues = async function() {
  if (this.status === "finished") {
    return [];
  }
  return this.populate('queueMembers');
};

// Method to check if a queue exists in this service
serviceSchema.methods.hasQueue = function(queueId) {
  if (this.status === "finished") {
    return false;
  }
  return this.queueMembers.includes(queueId);
};

// Method to get queue count
serviceSchema.methods.getQueueCount = function() {
  if (this.status === "finished") {
    return 0;
  }
  return this.queueMembers.length;
};

// Method to update service status
serviceSchema.methods.updateStatus = async function(newStatus) {
  if (!["scheduled", "active", "paused", "finished"].includes(newStatus)) {
    throw new Error('Invalid service status');
  }
  this.status = newStatus;
  if (newStatus === "finished") {
    this.endTime = new Date();
  }
  return this.save();
};

// Method to get service analytics
serviceSchema.methods.getAnalytics = async function() {
  await this.populate('queueMembers');
  
  const analytics = {
    totalQueues: this.queueMembers.length,
    averageQueueSize: 0,
    totalCustomers: 0,
    averageWaitTime: 0,
    peakHours: {},
    statusHistory: [],
    customerRetention: 0,
    serviceDuration: 0
  };

  if (this.queueMembers.length > 0) {
    let totalQueueSize = 0;
    let totalWaitTime = 0;
    let uniqueCustomers = new Set();
    let hourlyDistribution = {};

    for (const queue of this.queueMembers) {
      totalQueueSize += queue.queueMembers.length;
      
      queue.queueMembers.forEach(member => {
        uniqueCustomers.add(member.user.toString());
        
        const waitTime = member.joinedAt ? 
          (new Date() - new Date(member.joinedAt)) / (1000 * 60) : 0;
        totalWaitTime += waitTime;
        
        const hour = new Date(member.joinedAt).getHours();
        hourlyDistribution[hour] = (hourlyDistribution[hour] || 0) + 1;
      });
    }

    analytics.averageQueueSize = totalQueueSize / this.queueMembers.length;
    analytics.totalCustomers = uniqueCustomers.size;
    analytics.averageWaitTime = totalWaitTime / totalQueueSize;
    analytics.peakHours = hourlyDistribution;
  }

  // Calculate service duration
  const endTime = this.endTime || new Date();
  analytics.serviceDuration = (endTime - this.startTime) / (1000 * 60); // in minutes

  // Calculate customer retention
  const customerQueueCount = {};
  this.queueMembers.forEach(queue => {
    queue.queueMembers.forEach(member => {
      const userId = member.user.toString();
      customerQueueCount[userId] = (customerQueueCount[userId] || 0) + 1;
    });
  });

  const returningCustomers = Object.values(customerQueueCount).filter(count => count > 1).length;
  analytics.customerRetention = this.queueMembers.length > 0 ? 
    (returningCustomers / analytics.totalCustomers) * 100 : 0;

  return analytics;
};

// Method to get service performance metrics
serviceSchema.methods.getPerformanceMetrics = async function() {
  const metrics = {
    efficiency: 0,
    customerSatisfaction: 0,
    queueUtilization: 0,
    serviceUptime: 0,
    averageServiceTime: 0
  };

  if (this.queueMembers.length > 0) {
    const totalQueues = this.queueMembers.length;
    const totalCustomers = this.queueMembers.reduce((acc, queue) => 
      acc + queue.queueMembers.length, 0);
    
    // Calculate queue utilization
    metrics.queueUtilization = (totalCustomers / (totalQueues * 10)) * 100;
    
    // Calculate service efficiency
    const analytics = await this.getAnalytics();
    metrics.efficiency = 100 - (analytics.averageWaitTime / 60);
    
    // Calculate service uptime
    const totalDuration = (new Date() - this.startTime) / (1000 * 60 * 60);
    const activeDuration = this.status === 'active' ? totalDuration : 0;
    metrics.serviceUptime = (activeDuration / totalDuration) * 100;

    // Calculate average service time
    metrics.averageServiceTime = analytics.serviceDuration / totalCustomers;
  }

  return metrics;
};

const Service = mongoose.model("Service", serviceSchema);

export default Service;