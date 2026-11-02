import { createApp } from './app';
import { config } from './config/environment';
import { connectDatabase, disconnectDatabase } from './config/database';
import { seedDatabase } from './utils/seedData';
import { Color } from './models/Color';

const startServer = async () => {
  try {
    await connectDatabase();

    // Auto-seed in development or when database is fresh
    const colorCount = await Color.countDocuments();
    if (colorCount === 0) {
      console.log('📦 Database appears unseeded. Running initial seed data...');
      await seedDatabase();
    }

    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(`🚀 Smart Wall Paint Visualizer Backend running at http://localhost:${config.port}`);
      console.log(`🏥 Health check at: http://localhost:${config.port}/api/health`);
    });

    const shutdown = async (signal: string) => {
      console.log(`\n🛑 Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
