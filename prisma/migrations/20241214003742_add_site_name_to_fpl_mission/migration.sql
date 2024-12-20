/*
  Warnings:

  - You are about to drop the `MissionPlanningScript` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `RiskMatrix` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `siteName` to the `FPLMission` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "MissionPlanningScript" DROP CONSTRAINT "MissionPlanningScript_fplMissionId_fkey";

-- DropForeignKey
ALTER TABLE "RiskMatrix" DROP CONSTRAINT "RiskMatrix_fplMissionId_fkey";

-- AlterTable
ALTER TABLE "FPLMission" ADD COLUMN "siteName" TEXT NOT NULL DEFAULT 'Demo';

-- Update existing records
UPDATE "FPLMission" SET "siteName" = 'Demo' WHERE "siteName" IS NULL;

-- DropTable
DROP TABLE "MissionPlanningScript";

-- DropTable
DROP TABLE "RiskMatrix";

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "content" TEXT NOT NULL,
    "fplMissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RPIC" (
    "id" TEXT NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'DRAFT',
    "content" TEXT NOT NULL,
    "fplMissionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RPIC_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Document_fplMissionId_key" ON "Document"("fplMissionId");

-- CreateIndex
CREATE UNIQUE INDEX "RPIC_fplMissionId_key" ON "RPIC"("fplMissionId");

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_fplMissionId_fkey" FOREIGN KEY ("fplMissionId") REFERENCES "FPLMission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RPIC" ADD CONSTRAINT "RPIC_fplMissionId_fkey" FOREIGN KEY ("fplMissionId") REFERENCES "FPLMission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
