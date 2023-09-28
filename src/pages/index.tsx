import GlobalWrapper from "components/GlobalWrapper";
import { GetStaticProps, NextPage } from "next";
import { dehydrate, QueryClient } from "@tanstack/query-core";
import { PrismaClient } from "@prisma/client";
import useCandidateQuery, {
  CANDIDATES_QUERY_KEY,
} from "network/useCandidateQuery";
import useVoterQuery, { VOTERS_QUERY_KEY } from "network/useVoterQuery";
import { createClient } from "@supabase/supabase-js";
import CandidateTable from "components/CandidateTable";
import { useMemo } from "react";
import { ChatVoteData, VoteCategory, VoteData } from "types/vote";
import { CALCULATIONS_PRECISION } from "constants/vote";

const Home: NextPage = () => {
  const { data: candidates } = useCandidateQuery.getAll();
  const { data: voters } = useVoterQuery.getVoters();

  const candidatesWithCalculations = useMemo(
    () =>
      candidates?.map((candidate) => {
        const averagesByCategory = Object.values(VoteCategory).reduce(
          (acc, category) => {
            const voteData = candidate.votes.map((vote) => ({
              voterId: vote.voterId,
              value: (vote.voteData as VoteData)[category],
            }));

            const average = (
              voteData.reduce((acc, vote) => acc + parseFloat(vote.value), 0) /
              candidate.votes.length
            ).toFixed(CALCULATIONS_PRECISION);

            return {
              ...acc,
              [category]: average,
            };
          },
          {} as Record<VoteCategory, string>
        );

        const totalsByVoter = candidate.votes.reduce(
          (acc, vote) => {
            const voteData = vote.voteData as VoteData;

            const total = Object.values(VoteCategory)
              .reduce(
                (acc, category) => acc + parseFloat(voteData[category]),
                0
              )
              .toFixed(CALCULATIONS_PRECISION);

            return {
              ...acc,
              [vote.voterId]: total,
            };
          },
          {} as Record<string, string>
        );

        const votersAverage = Object.values(averagesByCategory)
          .reduce((acc, average) => acc + parseFloat(average), 0)
          .toFixed(CALCULATIONS_PRECISION);

        const chatsAverage = (
          candidate.votes.reduce((acc, vote) => {
            const chatVoteData = vote.chatVoteData as ChatVoteData | null;

            return (
              acc +
              (((chatVoteData?.voters || 0) *
                parseFloat(chatVoteData?.positivePercentage || "0")) /
                100) *
                30
            );
          }, 0) /
          candidate.votes.reduce(
            (acc, vote) =>
              acc + ((vote.chatVoteData as ChatVoteData | null)?.voters || 0),
            0
          )
        ).toFixed(CALCULATIONS_PRECISION);

        const totalAverage =
          chatsAverage && votersAverage
            ? (
                (Object.values(totalsByVoter).reduce(
                  (acc, average) => acc + (average ? parseFloat(average) : 0),
                  0
                ) +
                  parseFloat(chatsAverage)) /
                (Object.values(totalsByVoter).filter(
                  (average) => average !== undefined
                ).length +
                  1)
              ).toFixed(CALCULATIONS_PRECISION)
            : votersAverage;

        return {
          ...candidate,
          calculations: {
            averagesByCategory,
            chatsAverage,
            totalAverage,
            totalsByVoter,
            votersAverage,
          },
        };
      }),
    [candidates, voters]
  );

  return (
    <GlobalWrapper>
      {voters &&
        candidatesWithCalculations?.map((candidateWithCalculation) => (
          <CandidateTable
            key={candidateWithCalculation.id}
            candidate={candidateWithCalculation}
            voters={voters}
          />
        ))}
    </GlobalWrapper>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const queryClient = new QueryClient();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string,
    {
      auth: { persistSession: false },
    }
  );

  const prisma = new PrismaClient();
  const candidates = await prisma.candidate.findMany({
    include: {
      votes: true,
    },
  });
  const voters = await prisma.voter.findMany();

  queryClient.setQueryData([CANDIDATES_QUERY_KEY], candidates);

  queryClient.setQueryData(
    [VOTERS_QUERY_KEY],
    voters.map((voter) => ({
      ...voter,
      image:
        voter.image &&
        supabase.storage
          .from(process.env.SUPABASE_STORAGE_VOTERS_IMAGES_BUCKET as string)
          .getPublicUrl(voter.image).data.publicUrl,
    }))
  );

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};

export default Home;
