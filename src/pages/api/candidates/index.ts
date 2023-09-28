import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { PrismaClient } from "@prisma/client";

export default async function handle(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "GET") {
    const supabase = createPagesServerClient({ req, res });
    const session = await supabase.auth.getSession();

    if (session) {
      const prisma = new PrismaClient();

      const candidates = await prisma.candidate.findMany({
        include: {
          votes: true,
        },
      });

      res.status(200).json(candidates);
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
