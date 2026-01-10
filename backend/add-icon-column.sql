-- Add icon column to Category table
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "icon" TEXT;

