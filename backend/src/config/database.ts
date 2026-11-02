import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { config } from './environment';

let mongodInstance: MongoMemoryServer | null = null;

export const connectDatabase = async (): Promise<typeof mongoose> => {
  let uri = config.mongodbUri;

  if (uri === 'memory' || !uri) {
    console.log('🔄 Initializing in-memory MongoDB server for development/testing...');
    mongodInstance = await MongoMemoryServer.create();
    uri = mongodInstance.getUri();
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`✅ MongoDB connected successfully to: ${uri.startsWith('mongodb+srv') ? 'MongoDB Atlas' : uri.includes('127.0.0.1') || uri.includes('localhost') ? 'Local/Memory MongoDB' : uri}`);
    return conn;
  } catch (err: any) {
    if (uri !== 'memory' && !mongodInstance) {
      console.warn(`⚠️ Failed to connect to configured MongoDB (${uri}): ${err.message}. Falling back to in-memory MongoDB...`);
      mongodInstance = await MongoMemoryServer.create();
      const fallbackUri = mongodInstance.getUri();
      const conn = await mongoose.connect(fallbackUri);
      console.log(`✅ Connected to fallback in-memory MongoDB: ${fallbackUri}`);
      return conn;
    }
    throw err;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await mongoose.disconnect();
  if (mongodInstance) {
    await mongodInstance.stop();
    mongodInstance = null;
  }
  console.log('🛑 MongoDB disconnected');
};
