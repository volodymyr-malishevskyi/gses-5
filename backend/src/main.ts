import config from '@/config';

import prisma from '@/lib/prisma';
import nodeCron from 'node-cron';
import app from './app';
import { weatherBroadcastService } from './dependencies';

const port = process.env.PORT || 3000;

const server = app.listen(config.port, () => {
  console.log(`Server started: http://127.0.0.1:${port}`);
});

nodeCron.schedule('0 * * * *', async () => {
  weatherBroadcastService.broadcast('hourly').catch((error) => {
    console.error('Error broadcasting hourly weather:', error);
  });
});

nodeCron.schedule('0 0 0 * *', async () => {
  weatherBroadcastService.broadcast('daily').catch((error) => {
    console.error('Error broadcasting hourly weather:', error);
  });
});

const gracefulShutdown = async (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    console.log('HTTP server stopped.');
    try {
      await prisma.$disconnect();
      console.log('Prisma client disconnected.');
    } catch (e) {
      console.error('Error disconnecting Prisma client:', e);
    }
    process.exit(0);
  });

  // If the server does not close within a certain time, forcefully exit
  setTimeout(() => {
    console.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  gracefulShutdown('uncaughtException').then(() => process.exit(1));
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('unhandledRejection').then(() => process.exit(1));
});
