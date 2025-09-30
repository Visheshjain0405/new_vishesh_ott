import mongoose from "mongoose";
import logger from "./logger.js"; // path: config/logger.js

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        logger.info("✅ MongoDB connected");
    } catch (err) {
        logger.error(`❌ MongoDB connection failed: ${err.message}`);
        process.exit(1);
    }
};

export default connectDB;
