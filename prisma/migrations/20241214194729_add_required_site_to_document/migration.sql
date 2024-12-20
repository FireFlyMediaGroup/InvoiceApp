/*
  Warnings:

  - Added the required column `site` to the `Document` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "site" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "RiskMatrix" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "fplMissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RiskMatrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MissionPlanningScript" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "site" TEXT NOT NULL,
    "fplMissionId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissionPlanningScript_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RiskMatrix" ADD CONSTRAINT "RiskMatrix_fplMissionId_fkey" FOREIGN KEY ("fplMissionId") REFERENCES "FPLMission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskMatrix" ADD CONSTRAINT "RiskMatrix_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionPlanningScript" ADD CONSTRAINT "MissionPlanningScript_fplMissionId_fkey" FOREIGN KEY ("fplMissionId") REFERENCES "FPLMission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MissionPlanningScript" ADD CONSTRAINT "MissionPlanningScript_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
