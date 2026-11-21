import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import mariadb from 'mariadb';

const globalForPrisma = globalThis;

function getMariaDbPool() {
  if (!globalForPrisma._mariadbPool) {
    const rawUrl = process.env.DATABASE_URL || "mysql://username:password@localhost:3306/agro_mart_db";
    try {
      const match = rawUrl.match(/^mysql:\/\/([^:]+):(.+)@([^:]+):(\d+)\/(.+)$/);
      if (match) {
        const [, user, password, host, port, database] = match;
        globalForPrisma._mariadbPool = mariadb.createPool({
          host,
          port: parseInt(port, 10) || 3306,
          user,
          password,
          database: database.split('?')[0],
          connectionLimit: 5,
          acquireTimeout: 10000,
          connectTimeout: 8000,
          idleTimeout: 60000,
        });
      } else {
        globalForPrisma._mariadbPool = mariadb.createPool(rawUrl);
      }
    } catch {
      globalForPrisma._mariadbPool = mariadb.createPool(rawUrl);
    }
  }
  return globalForPrisma._mariadbPool;
}

function createPrismaClient() {
  const pool = getMariaDbPool();
  const adapter = new PrismaMariaDb(pool);

  return new PrismaClient({
    adapter,
    log: ['error'],
  });
}

export const prisma = globalForPrisma.prisma || createPrismaClient();

// Maintain singleton in both development and production to prevent connection exhaustion
globalForPrisma.prisma = prisma;

export default prisma;
