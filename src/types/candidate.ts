import { Prisma } from "@prisma/client";
import { VoteCategory } from "types/vote";

export type CandidateWithVotes = Prisma.CandidateGetPayload<{
  include: { votes: true };
}> & {
  createdAt: string;
};

export interface CandidateWithVotesAndCalculations extends CandidateWithVotes {
  calculations: {
    averagesByCategory: Record<VoteCategory, string>;
    totalsByVoter: Record<string, string>;
    votersAverage: string;
    chatsAverage?: string;
    totalAverage: string;
  };
}

export interface CandidateWithVotesAndCalculationsAndPosition
  extends CandidateWithVotesAndCalculations {
  position: number;
}

export interface DeleteVotePayload {
  candidateId: string;
}
