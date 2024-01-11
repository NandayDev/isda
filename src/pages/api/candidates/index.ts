import { NextApiRequest, NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const prisma = new PrismaClient();

    const candidates = await prisma.candidate.findMany({
      include: {
        votes: true,
      },
    });

    res.status(200).json(candidates);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
