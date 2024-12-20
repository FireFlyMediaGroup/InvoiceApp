/*
  Warnings:

  - Added the required column `createdById` to the `TailboardDocument` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `content` on the `TailboardDocument` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TailboardDocument" ADD COLUMN     "approvedAt" TIMESTAMP(3),
ADD COLUMN     "approvedById" TEXT,
ADD COLUMN     "createdById" TEXT NOT NULL,
ADD COLUMN     "rejectedAt" TIMESTAMP(3),
ADD COLUMN     "rejectedById" TEXT,
DROP COLUMN "content",
ADD COLUMN     "content" JSONB NOT NULL;

-- AddForeignKey
ALTER TABLE "TailboardDocument" ADD CONSTRAINT "TailboardDocument_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailboardDocument" ADD CONSTRAINT "TailboardDocument_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TailboardDocument" ADD CONSTRAINT "TailboardDocument_rejectedById_fkey" FOREIGN KEY ("rejectedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
