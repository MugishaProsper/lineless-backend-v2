import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Assuming business users are stored in the User collection
    required: true,
  },
  serviceName: {
    type: String,
    required: true,
    trim: true,
  },
  estimatedWaitTime: {
    type: Number,
    required: true,
    min: 1,
  },
  maxCapacity: {
    type: Number,
    min: 0,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const Service = mongoose.model('Service', serviceSchema);

export default Service; 