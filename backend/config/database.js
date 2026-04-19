// Conexão MongoDB (abstraída) - Placeholder
const mongoose = require('mongoose');

/**
 * Connect to MongoDB.
 * Abstracted here so the connection layer can be swapped (e.g., to PostgreSQL via Sequelize)
 * without touching any business logic.
 */
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Mongoose 7+ has these defaults on, kept for clarity
    });

    console.log(`✅ MongoDB connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected. Retrying...');
    });

  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;