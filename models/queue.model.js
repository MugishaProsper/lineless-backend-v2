import mongoose from "mongoose";

const queueSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  customerName: {
    type: String,
    required: true
  },
  service: {
    type: String,
    required: true
  },
  position: {
    type: Number,
    required: true
  },
  estimatedWait: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['waiting', 'called', 'next'],
    default: 'waiting'
  },
  joinTime: {
    type: Date,
    default: Date.now
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
queueSchema.index({ businessId: 1, status: 1 });
queueSchema.index({ customerId: 1, status: 1 });

// Method to get queue position
queueSchema.methods.getQueuePosition = async function () {
  const count = await this.constructor.countDocuments({
    businessId: this.businessId,
    status: 'waiting',
    createdAt: { $lt: this.createdAt }
  });
  return count + 1;
};

// Static method to get active queues for a business
queueSchema.statics.getActiveQueues = function (businessId) {
  return this.find({
    businessId,
    status: { $in: ['waiting', 'next'] }
  }).sort({ createdAt: 1 });
};

// Static method to get customer's active queue
queueSchema.statics.getCustomerActiveQueue = function (customerId) {
  return this.findOne({
    customerId,
    status: { $in: ['waiting', 'next'] }
  });
};

const Queue = mongoose.model('Queue', queueSchema);

export default Queue;