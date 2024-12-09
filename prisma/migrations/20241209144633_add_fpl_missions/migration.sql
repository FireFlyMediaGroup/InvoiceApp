-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('DRAFT', 'PENDING', 'APPROVED');

-- CreateTable
CREATE TABLE "FPLMission" (
    "id" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "siteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FPLMission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskMatrix" (
    "id" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "content" TEXT NOT NULL,
    "fplMissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskMatrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionPlanningScript" (
    "id" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "content" TEXT NOT NULL,
    "fplMissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissionPlanningScript_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TailboardDocument" (
    "id" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "content" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "fplMissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TailboardDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RiskMatrix_fplMissionId_key" ON "RiskMatrix"("fplMissionId");

-- CreateIndex
CREATE UNIQUE INDEX "MissionPlanningScript_fplMissionId_key" ON "MissionPlanningScript"("fplMissionId");

-- AddForeignKey
ALTER TABLE "FPLMission" ADD CONSTRAINT "FPLMission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskMatrix" ADD CONSTRAINT "RiskMatrix_fplMissionId_fkey" FOREIGN KEY ("fplMissionId") REFERENCES "FPLMission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionPlanningScript" ADD CONSTRAINT "MissionPlanningScript_fplMissionId_fkey" FOREIGN KEY ("fplMissionId") REFERENCES "FPLMission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailboardDocument" ADD CONSTRAINT "TailboardDocument_fplMissionId_fkey" FOREIGN KEY ("fplMissionId") REFERENCES "FPLMission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
