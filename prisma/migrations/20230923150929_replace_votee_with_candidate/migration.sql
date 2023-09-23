/*
  Warnings:

  - You are about to drop the column `voteeId` on the `Vote` table. All the data in the column will be lost.
  - You are about to drop the `Votee` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `candidateId` to the `Vote` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Vote" DROP CONSTRAINT "Vote_voteeId_fkey";

-- AlterTable
ALTER TABLE "Vote" DROP COLUMN "voteeId",
ADD COLUMN     "candidateId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Votee";

-- CreateTable
CREATE TABLE "Candidate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Candidate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Vote" ADD CONSTRAINT "Vote_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "Candidate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
