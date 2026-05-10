-- AlterTable
ALTER TABLE "PromptTemplate" ADD COLUMN "excludeSources" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
