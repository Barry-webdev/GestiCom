import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model';

dotenv.config();

const createAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log('✅ Connected to MongoDB');

    // Check if admin exists
    const adminExists = await User.findOne({ email: 'admin@gestistock.gn' });

    if (adminExists) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    const admin = await User.create({
      name: 'Admin Principal',
      email: 'admin@gestistock.gn',
      phone: '+224622123456',
      password: 'admin123',
      role: 'admin',
      status: 'active',
    });

    console.log('✅ Admin user created successfully');
    console.log('📧 Email: admin@gestistock.gn');
    console.log('🔑 Password: admin123');
    console.log('👤 Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

createAdmin();
