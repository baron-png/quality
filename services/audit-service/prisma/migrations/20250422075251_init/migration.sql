/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Audit` table. All the data in the column will be lost.
  - You are about to drop the column `team` on the `Audit` table. All the data in the column will be lost.
  - The `scope` column on the `Audit` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `specificAuditObjective` column on the `Audit` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `methods` column on the `Audit` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `criteria` column on the `Audit` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `updatedAt` to the `AuditProgram` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "AcceptedAudit" DROP CONSTRAINT "AcceptedAudit_auditorId_fkey";

-- DropForeignKey
ALTER TABLE "Audit" DROP CONSTRAINT "Audit_auditProgramId_fkey";

-- AlterTable
ALTER TABLE "Audit" DROP COLUMN "createdAt",
DROP COLUMN "team",
DROP COLUMN "scope",
ADD COLUMN     "scope" TEXT[],
DROP COLUMN "specificAuditObjective",
ADD COLUMN     "specificAuditObjective" TEXT[],
DROP COLUMN "methods",
ADD COLUMN     "methods" TEXT[],
DROP COLUMN "criteria",
ADD COLUMN     "criteria" TEXT[];

-- AlterTable
ALTER TABLE "AuditProgram" ADD COLUMN     "departmentId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "status" DROP DEFAULT;

-- AddForeignKey
ALTER TABLE "Audit" ADD CONSTRAINT "Audit_auditProgramId_fkey" FOREIGN KEY ("auditProgramId") REFERENCES "AuditProgram"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
