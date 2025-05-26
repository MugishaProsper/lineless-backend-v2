import mongoose from "mongoose";

const ratingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  businessId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient querying
ratingSchema.index({ businessId: 1, createdAt: -1 });
ratingSchema.index({ userId: 1, createdAt: -1 });

// Static method to get business ratings
ratingSchema.statics.getBusinessRatings = function (businessId, page = 1, limit = 10) {
  return this.find({ businessId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('userId', 'name');
};

// Static method to get user ratings
ratingSchema.statics.getUserRatings = function (userId, page = 1, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('businessId', 'name');
};

// Static method to get average rating for a business
ratingSchema.statics.getBusinessAverageRating = async function (businessId) {
  const result = await this.aggregate([
    { $match: { businessId: mongoose.Types.ObjectId(businessId) } },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 }
      }
    }
  ]);

  return result[0] || { averageRating: 0, totalRatings: 0 };
};

const Rating = mongoose.model('Rating', ratingSchema);

export default Rating;