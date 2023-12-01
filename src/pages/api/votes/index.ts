import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { PrismaClient } from "@prisma/client";
import { VotePayload } from "types/vote";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const supabase = createPagesServerClient({ req, res });
    const session = await supabase.auth.getSession();

    if (session.data.session) {
      const prisma = new PrismaClient();
      const votePayload = req.body as VotePayload;

      const candidate = await prisma.candidate.create({
        data: {
          name: votePayload.candidateName,
        },
      });

      await prisma.vote.createMany({
        data: Object.entries(votePayload.vote).map(([voterId, votes]) => ({
          candidateId: candidate.id,
          voterId: voterId,
          voteData: votes.votes || {},
          chatVoteData: votes.chatVotes,
        })),
      });

      const updatedCandidate = await prisma.candidate.findUnique({
        where: {
          id: candidate.id,
        },
        include: {
          votes: true,
        },
      });

      res.status(200).json(updatedCandidate);
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
