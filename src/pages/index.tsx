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
import { useMemo, useState } from "react";
import { ChatVoteData, VoteCategory, VoteData } from "types/vote";
import { CALCULATIONS_PRECISION } from "constants/vote";
import {
  Flex,
  FormControl,
  FormLabel,
  Input,
  Select,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { SortType } from "types/sort";
import { SORT_TEXT } from "constants/sort";
import { CandidateWithVotesAndCalculations } from "types/candidate";
import useFuse from "hooks/useFuse";
import Head from "next/head";
import { SITE_TITLE } from "constants/base";

const Home: NextPage = () => {
  const [sortType, setSortType] = useState<SortType>(SortType.VoteAsc);

  const { data: candidates } = useCandidateQuery.getAll();
  const { data: voters } = useVoterQuery.getVoters();

  const {
    result: candidatesSearchResult,
    search,
    term,
  } = useFuse(candidates, {
    keys: ["name"],
  });

  const sortFunctions = {
    [SortType.VoteAsc]: (
      a: CandidateWithVotesAndCalculations,
      b: CandidateWithVotesAndCalculations
    ) =>
      parseFloat(a.calculations.totalAverage) -
      parseFloat(b.calculations.totalAverage),
    [SortType.VoteDesc]: (
      a: CandidateWithVotesAndCalculations,
      b: CandidateWithVotesAndCalculations
    ) =>
      parseFloat(b.calculations.totalAverage) -
      parseFloat(a.calculations.totalAverage),
    [SortType.NameAsc]: (
      a: CandidateWithVotesAndCalculations,
      b: CandidateWithVotesAndCalculations
    ) => a.name.localeCompare(b.name),
    [SortType.NameDesc]: (
      a: CandidateWithVotesAndCalculations,
      b: CandidateWithVotesAndCalculations
    ) => b.name.localeCompare(a.name),
    [SortType.DateAsc]: (
      a: CandidateWithVotesAndCalculations,
      b: CandidateWithVotesAndCalculations
    ) => a.name.localeCompare(b.name),
    [SortType.DateDesc]: (
      a: CandidateWithVotesAndCalculations,
      b: CandidateWithVotesAndCalculations
    ) => b.name.localeCompare(a.name),
  };

  const candidatesWithCalculations = useMemo(
    () =>
      candidatesSearchResult
        ?.map((candidate) => {
          const averagesByCategory = Object.values(VoteCategory).reduce(
            (acc, category) => {
              const voteData = candidate.votes.map((vote) => ({
                voterId: vote.voterId,
                value: (vote.voteData as VoteData)[category],
              }));

              const average = (
                voteData.reduce(
                  (acc, vote) => acc + parseFloat(vote.value),
                  0
                ) / candidate.votes.length
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
        })
        .sort(sortFunctions[sortType]) || [],
    [candidatesSearchResult, sortFunctions, sortType, voters]
  );

  return (
    <GlobalWrapper>
      <Head>
        <title>{SITE_TITLE}</title>
      </Head>
      <Flex ml={"auto"} justifyContent={"flex-end"} gap={2} mb={4}>
        <FormControl>
          <FormLabel>Cerca</FormLabel>
          <Input
            bg={useColorModeValue("white", "black")}
            placeholder={"Cerca..."}
            onChange={(event) => search(event.target.value)}
            value={term}
          />
        </FormControl>
        <FormControl>
          <FormLabel>Ordina per</FormLabel>
          <Select
            bg={useColorModeValue("white", "black")}
            onChange={(event) => setSortType(event.target.value as SortType)}
            value={sortType}
          >
            {Object.values(SortType).map((sortType) => (
              <option key={sortType} value={sortType}>
                {SORT_TEXT[sortType]}
              </option>
            ))}
          </Select>
        </FormControl>
      </Flex>
      {candidatesWithCalculations.length === 0 ? (
        <Text fontSize={"lg"} m={"auto"}>
          &quot;Non sento l&apos;Africa... Quando io guardo il fiume Ngube io
          vedo Pomezia, lo capisci che c&apos;è un problema o no?&quot;
        </Text>
      ) : (
        <Flex direction={"column"} gap={4} overflowY={"auto"}>
          {voters &&
            candidatesWithCalculations.map((candidateWithCalculation) => (
              <CandidateTable
                key={candidateWithCalculation.id}
                candidate={candidateWithCalculation}
                voters={voters}
              />
            ))}
        </Flex>
      )}
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
