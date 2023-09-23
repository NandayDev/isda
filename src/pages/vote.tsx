import { GetStaticProps, NextPage } from "next";
import GlobalWrapper from "components/GlobalWrapper";
import useVoterQuery, { VOTERS_QUERY_KEY } from "network/useVoterQuery";
import { useEffect, useMemo, useState } from "react";
import { PrismaClient, Voter } from "@prisma/client";
import { dehydrate, QueryClient } from "@tanstack/query-core";
import { createClient } from "@supabase/supabase-js";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import Image from "next/image";
import Head from "next/head";
import { SITE_TITLE } from "constants/base";
import { VOTE_CATEGORY_NAMES, VoteCategory } from "constants/vote";

const Vote: NextPage = () => {
  const [selectedVoters, setSelectedVoters] = useState<
    Record<string, { votes?: { [category in VoteCategory]?: number } }>
  >({});

  const { data: voters, isLoading: isVotersLoading } =
    useVoterQuery.getVoters();

  const calculations = useMemo(() => {
    const averagesByCategory = Object.values(VoteCategory).reduce(
      (acc, category) => {
        const voters = Object.values(selectedVoters).filter(
          (selectedVoter) => selectedVoter.votes?.[category] !== undefined
        ).length;

        acc[category] = voters
          ? (
              Object.values(selectedVoters).reduce(
                (acc, voter) => acc + (voter.votes?.[category] || 0),
                0
              ) / voters
            ).toFixed(2)
          : undefined;
        return acc;
      },
      {} as Record<VoteCategory, string | undefined>
    );

    return {
      averagesByCategory,
      totalAverage: Object.values(averagesByCategory).some(
        (average) => average !== undefined
      )
        ? Object.values(averagesByCategory)
            .reduce(
              (acc, average) => acc + (average ? parseFloat(average) : 0),
              0
            )
            .toFixed(2)
        : undefined,
      totalsByVoter: Object.entries(selectedVoters).reduce(
        (acc, [id, voter]) => ({
          ...acc,
          [id]: voter.votes
            ? Object.values(voter.votes || {})
                .reduce((acc, vote) => acc + vote, 0)
                .toFixed(2)
            : undefined,
        }),
        {} as Record<string, string | undefined>
      ),
    };
  }, [selectedVoters]);

  console.log(calculations);

  const votersObject = useMemo(
    () =>
      voters?.reduce(
        (acc, voter) => {
          acc[voter.id] = voter;
          return acc;
        },
        {} as Record<string, Voter>
      ) || {},
    [voters]
  );

  const selectedVotersIds = useMemo(
    () => Object.keys(selectedVoters),
    [selectedVoters]
  );

  const notSelectedVotersIds = useMemo(
    () =>
      voters
        ?.filter((voter) => !selectedVotersIds.includes(voter.id))
        .map((voter) => voter.id) || [],
    [selectedVotersIds, voters]
  );

  useEffect(() => {
    if (voters && selectedVotersIds.length === 0) {
      setSelectedVoters({ [voters[0].id]: {} });
    }
  }, [voters]);

  return (
    <GlobalWrapper>
      <Head>
        <title>Vota - {SITE_TITLE}</title>
      </Head>
      <Flex
        alignItems={"center"}
        justifyContent={"space-between"}
        gap={4}
        mb={2}
        w={"full"}
      >
        <Text fontSize={"4xl"} fontWeight={"bold"}>
          Vota
        </Text>
        {notSelectedVotersIds.length > 0 && (
          <Menu>
            <MenuButton as={Button} size={"sm"}>
              <AddIcon mr={2} /> Aggiungi votante
            </MenuButton>
            <MenuList>
              {notSelectedVotersIds.map((voterId) => (
                <MenuItem
                  key={voterId}
                  onClick={() =>
                    setSelectedVoters({ ...selectedVoters, [voterId]: {} })
                  }
                >
                  {votersObject[voterId].name}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
        )}
      </Flex>
      <Table bg={useColorModeValue("white", "black")}>
        <Thead>
          <Th>
            <FormControl>
              <FormLabel textTransform={"unset"}>Nome candidato</FormLabel>
              <Input />
            </FormControl>
          </Th>
          {votersObject &&
            selectedVotersIds.map((voterId) => (
              <Th>
                <Flex alignItems={"center"} direction={"column"} gap={2}>
                  {votersObject[voterId].image && (
                    <Image
                      src={votersObject[voterId].image as string}
                      alt={votersObject[voterId].name}
                      width={100}
                      height={100}
                    />
                  )}
                  {votersObject[voterId].name}
                </Flex>
              </Th>
            ))}
          <Th>
            <Text align={"center"}>Media</Text>
          </Th>
        </Thead>
        <Tbody>
          {Object.values(VoteCategory).map((category, i) => (
            <Tr>
              <Td>
                <Text fontWeight={"medium"}>
                  {VOTE_CATEGORY_NAMES[category]}
                </Text>
              </Td>
              {selectedVotersIds.map((voterId) => (
                <Td>
                  <NumberInput
                    precision={2}
                    min={0}
                    max={10}
                    onChange={(_, value) =>
                      setSelectedVoters((selectedVoters) => ({
                        ...selectedVoters,
                        [voterId]: {
                          ...selectedVoters[voterId],
                          votes: {
                            ...selectedVoters[voterId].votes,
                            [category]: value,
                          },
                        },
                      }))
                    }
                  >
                    <NumberInputField textAlign={"center"} />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </Td>
              ))}
              <Td>
                <Text align={"center"}>
                  {calculations.averagesByCategory[category]}
                </Text>
              </Td>
            </Tr>
          ))}
          <Tr>
            <Td>
              <Text fontWeight={"medium"}>Voto finale (/30)</Text>
            </Td>
            {selectedVotersIds.map((voterId) => (
              <Td>
                <Text align={"center"}>
                  {calculations.totalsByVoter[voterId]}
                </Text>
              </Td>
            ))}
            <Td>
              <Text align={"center"} fontWeight={"medium"} fontSize={"2xl"}>
                {calculations.totalAverage}
              </Text>
            </Td>
          </Tr>
        </Tbody>
      </Table>
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
  const voters = await prisma.voter.findMany();

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

export default Vote;
