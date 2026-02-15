import mongoose from 'mongoose';

const MONGO_URI =
    process.env.MONGO_URI ||
    'mongodb+srv://hireready-user:hireready123@cluster1.urwgfxq.mongodb.net/hireready?retryWrites=true&w=majority';

const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

export default connectDB;
