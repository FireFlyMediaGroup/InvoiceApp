-- CreateEnum
CREATE TYPE "POWRAStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED');

-- CreateTable
CREATE TABLE "POWRA" (
    "id" TEXT NOT NULL,
    "status" "POWRAStatus" NOT NULL DEFAULT 'DRAFT',
    "headerFields" JSONB NOT NULL,
    "beforeStartChecklist" JSONB NOT NULL,
    "controlMeasures" JSONB NOT NULL,
    "reviewComments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "POWRA_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "POWRA" ADD CONSTRAINT "POWRA_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
