import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { execSync } from 'child_process';

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Reset demo user and related data, then re-seed the database
async function resetDemo() {
  const demoEmail = process.env.DEMO_USER_EMAIL ?? 'test@gmail.com';

  console.log(`Resetting demo data for ${demoEmail}`);

  const user = await prisma.user.findUnique({ where: { email: demoEmail } });

  if (user) {
    await prisma.application.deleteMany({ where: { userId: user.id } });
    await prisma.company.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log('Deleted existing demo user and related demo data');
  } else {
    console.log('No existing demo user found — proceeding to seed');
  }

  // Run the seed using Prisma's built-in seed command
  try {
    console.log('Running seed script...');
    execSync('npx prisma db seed', { stdio: 'inherit' });
    console.log('Demo reset complete');
  } catch (err) {
    console.error('Seeding failed', err);
    throw err;
  }
}

resetDemo()
  .catch((err) => {
    console.error('Demo reset failed', err);
    process.exit(1);
  })
  .finally(() => {
    // do not return the Promise from finally; ignore it explicitly
    void prisma.$disconnect();
  });
