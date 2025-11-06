/*
  Warnings:

  - Made the column `date` on table `LogItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LogItem" ALTER COLUMN "date" SET NOT NULL;
