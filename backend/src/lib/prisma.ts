import config from '@/config';
import { PrismaClient } from '@/generated/prisma';

const isDev = config.nodeEnv === 'development';

const prisma = new PrismaClient({
  log: isDev ? ['query', 'info', 'warn', 'error'] : [],
});

// Declare a global variable to store the Prisma client instance
// to avoid creating new instances during hot-reloading in development.
// declare global {
//   // eslint-disable-next-line no-var
//   var prisma: PrismaClient | undefined;
// }

// export const prisma =
//   global.prisma ||
//   new PrismaClient({
//     log: isDev ? ['query', 'info', 'warn', 'error'] : [],
//   });

// if (isDev) {
//   global.prisma = prisma;
// }

export default prisma;

export { PrismaClient };
