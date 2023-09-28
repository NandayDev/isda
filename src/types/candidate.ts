import { Prisma } from "@prisma/client";

export type CandidateWithVotes = Prisma.CandidateGetPayload<{
  include: { votes: true };
}>;
