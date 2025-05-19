import config from '@/config';

import { PrismaClient } from '@/generated/prisma';

const isDev = config.nodeEnv === 'development';

const prisma = new PrismaClient({
  log: isDev ? ['query', 'info', 'warn', 'error'] : [],
});

export default prisma;

export * from '@/generated/prisma';
