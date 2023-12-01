import { NextApiRequest, NextApiResponse } from "next";
import { createPagesServerClient } from "@supabase/auth-helpers-nextjs";
import { PrismaClient } from "@prisma/client";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (req.method === "DELETE") {
    const supabase = createPagesServerClient({ req, res });
    const session = await supabase.auth.getSession();

    if (session.data.session) {
      const prisma = new PrismaClient();
      const candidate = await prisma.candidate.delete({
        where: {
          id: id as string,
        },
      });

      res.status(200).json(candidate);
    } else {
      res.status(401).json({ error: "Unauthorized" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
