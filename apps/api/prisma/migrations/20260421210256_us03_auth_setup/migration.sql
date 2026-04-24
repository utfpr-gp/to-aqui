/*
  Warnings:

  - A unique constraint covering the columns `[courseId,studentEmail]` on the table `enrollments` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ALTER COLUMN "ra" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "enrollments_studentEmail_idx" ON "enrollments"("studentEmail");

-- CreateIndex
CREATE UNIQUE INDEX "enrollments_courseId_studentEmail_key" ON "enrollments"("courseId", "studentEmail");
