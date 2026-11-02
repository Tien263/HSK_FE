const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd());
const { PrismaClient } = require('../src/generated/prisma');
const fs = require('node:fs');

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Running AI rate limiting migration...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "dailyAiQuota" INTEGER NOT NULL DEFAULT 5;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "aiUsageToday" INTEGER NOT NULL DEFAULT 0;
    `);
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "aiUsageResetDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
    `);
    console.log('Migration executed successfully! Columns added to User table.');

    // Verify
    const sample = await prisma.$queryRawUnsafe(`
      SELECT id, username, "dailyAiQuota", "aiUsageToday", "aiUsageResetDate" 
      FROM "User" 
      LIMIT 3
    `);
    console.log('Sample users with AI quota:', sample);
  } catch (err) {
    console.error('Migration error:', err.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
}

main();
