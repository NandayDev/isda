/*
  Warnings:

  - You are about to drop the column `type` on the `Voter` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Vote" ADD COLUMN     "chatVoteData" JSONB;

-- AlterTable
ALTER TABLE "Voter" DROP COLUMN "type";

-- DropEnum
DROP TYPE "VoterType";
