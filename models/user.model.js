import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema({
  name: { type: String, required: true, index: true },
  email: { type: String, required: true, index: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "business"], default: "user" },
  phoneNumber: { type: String }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Method to get public profile
userSchema.methods.getPublicProfile = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Create indexes
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ name: 1 });

const User = mongoose.model("User", userSchema);

export default User;