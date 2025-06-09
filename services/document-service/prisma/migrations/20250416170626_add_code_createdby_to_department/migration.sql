/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Department` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Department" ADD COLUMN     "code" TEXT,
ADD COLUMN     "createdBy" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Department_code_key" ON "Department"("code");
