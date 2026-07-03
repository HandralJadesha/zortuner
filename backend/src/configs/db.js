import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/layerly';
    await mongoose.connect(mongoUri);
    console.log('MongoDB Connected successfully to Layerly database');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
