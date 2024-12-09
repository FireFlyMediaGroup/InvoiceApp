/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

// Log the DATABASE_URL (make sure to redact sensitive information)
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Define interfaces for our custom models
interface FPLMission {
  id: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED';
  siteId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface RiskMatrix {
  id: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED';
  content: string;
  fplMissionId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Define a type that represents the expected structure of the Prisma client
type PrismaWithCustomModels = PrismaClient & {
  FPLMission: {
    findMany: () => Promise<FPLMission[]>;
  };
  RiskMatrix: {
    findMany: () => Promise<RiskMatrix[]>;
  };
};

async function main() {
  console.log('Available models in Prisma client:');
  console.log(Object.keys(prisma));

  // Test querying the FPLMission model
  try {
    // Using type assertion here because TypeScript doesn't recognize the dynamically generated models
    const fplMissions = await (prisma as PrismaWithCustomModels).FPLMission.findMany();
    console.log('FPLMissions:', fplMissions);
  } catch (error) {
    console.error('Error querying FPLMission:', error);
  }

  // Test querying the RiskMatrix model
  try {
    // Using type assertion here because TypeScript doesn't recognize the dynamically generated models
    const riskMatrices = await (prisma as PrismaWithCustomModels).RiskMatrix.findMany();
    console.log('RiskMatrices:', riskMatrices);
  } catch (error) {
    console.error('Error querying RiskMatrix:', error);
  }
}

main()
  .catch((e) => {
    console.error('Unhandled error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
