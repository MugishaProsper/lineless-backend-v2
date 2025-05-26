import mongoose from "mongoose";
import dotenv from 'dotenv';

dotenv.config();

export const connectToDB  = () => {
  try {
    mongoose.connect(process.env.MONGODB_URI).then( () => console.log("✅ Connected to MongoDB") )
  } catch (error) {
    console.log("❌ Failed to connect to MongoDB", error);
  }
}