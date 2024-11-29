-- CreateEnum (if not exists)
DO $$ BEGIN
    CREATE TYPE "POWRAStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- AlterTable
ALTER TABLE "POWRA" 
ADD COLUMN IF NOT EXISTS "chiefPilot" TEXT,
ADD COLUMN IF NOT EXISTS "date" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "hse" TEXT,
ADD COLUMN IF NOT EXISTS "lessonsLearned" BOOLEAN,
ADD COLUMN IF NOT EXISTS "location" TEXT,
ADD COLUMN IF NOT EXISTS "pilotName" TEXT,
ADD COLUMN IF NOT EXISTS "reviewDates" TIMESTAMP(3)[],
ADD COLUMN IF NOT EXISTS "reviewNames" TEXT[],
ADD COLUMN IF NOT EXISTS "site" TEXT,
ADD COLUMN IF NOT EXISTS "time" TEXT;

-- Temporarily store controlMeasures and headerFields data
ALTER TABLE "POWRA" 
ADD COLUMN IF NOT EXISTS "temp_controlMeasures" JSONB,
ADD COLUMN IF NOT EXISTS "temp_headerFields" JSONB;

UPDATE "POWRA" 
SET "temp_controlMeasures" = "controlMeasures"::JSONB,
    "temp_headerFields" = "headerFields"::JSONB
WHERE "controlMeasures" IS NOT NULL OR "headerFields" IS NOT NULL;

-- Convert beforeStartChecklist to array
ALTER TABLE "POWRA" 
ADD COLUMN IF NOT EXISTS "temp_beforeStartChecklist" TEXT[];

UPDATE "POWRA" 
SET "temp_beforeStartChecklist" = ARRAY(SELECT jsonb_array_elements_text("beforeStartChecklist"::JSONB))
WHERE "beforeStartChecklist" IS NOT NULL;

-- Drop old columns
ALTER TABLE "POWRA" 
DROP COLUMN IF EXISTS "controlMeasures",
DROP COLUMN IF EXISTS "headerFields",
DROP COLUMN IF EXISTS "beforeStartChecklist";

-- Rename temp columns
ALTER TABLE "POWRA" 
RENAME COLUMN "temp_beforeStartChecklist" TO "beforeStartChecklist";

-- Set default values for new columns
UPDATE "POWRA" 
SET "chiefPilot" = COALESCE("chiefPilot", 'Unknown'),
    "date" = COALESCE("date", NOW()),
    "hse" = COALESCE("hse", 'Unknown'),
    "lessonsLearned" = COALESCE("lessonsLearned", false),
    "location" = COALESCE("location", 'Unknown'),
    "pilotName" = COALESCE("pilotName", 'Unknown'),
    "site" = COALESCE("site", 'Unknown'),
    "time" = COALESCE("time", '00:00');

-- Make columns NOT NULL
ALTER TABLE "POWRA" 
ALTER COLUMN "chiefPilot" SET NOT NULL,
ALTER COLUMN "date" SET NOT NULL,
ALTER COLUMN "hse" SET NOT NULL,
ALTER COLUMN "lessonsLearned" SET NOT NULL,
ALTER COLUMN "location" SET NOT NULL,
ALTER COLUMN "pilotName" SET NOT NULL,
ALTER COLUMN "site" SET NOT NULL,
ALTER COLUMN "time" SET NOT NULL;

-- CreateTable
CREATE TABLE "ControlMeasure" (
    "id" TEXT NOT NULL,
    "hazardNo" TEXT NOT NULL,
    "measures" TEXT NOT NULL,
    "risk" TEXT NOT NULL,
    "powraId" TEXT NOT NULL,

    CONSTRAINT "ControlMeasure_pkey" PRIMARY KEY ("id")
);

-- Populate ControlMeasure table with data from temp_controlMeasures
INSERT INTO "ControlMeasure" (id, "hazardNo", measures, risk, "powraId")
SELECT 
    gen_random_uuid(),
    cm->>'hazardNo',
    cm->>'measures',
    cm->>'risk',
    "POWRA".id
FROM 
    "POWRA",
    jsonb_array_elements("POWRA"."temp_controlMeasures") AS cm
WHERE "POWRA"."temp_controlMeasures" IS NOT NULL;

-- Drop temporary columns
ALTER TABLE "POWRA" 
DROP COLUMN IF EXISTS "temp_controlMeasures",
DROP COLUMN IF EXISTS "temp_headerFields";

-- AddForeignKey
ALTER TABLE "ControlMeasure" ADD CONSTRAINT "ControlMeasure_powraId_fkey" FOREIGN KEY ("powraId") REFERENCES "POWRA"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create Risk enum and update ControlMeasure table
DO $$ BEGIN
    CREATE TYPE "Risk" AS ENUM ('L', 'M', 'H');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "ControlMeasure" 
ALTER COLUMN "risk" TYPE "Risk" USING ("risk"::text::"Risk");
