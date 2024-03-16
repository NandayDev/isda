import { GetStaticProps, NextPage } from "next";
import GlobalWrapper from "components/GlobalWrapper";
import useVoterQuery, { VOTERS_QUERY_KEY } from "network/useVoterQuery";
import { useEffect, useMemo } from "react";
import { PrismaClient, Voter } from "@prisma/client";
import { dehydrate, QueryClient } from "@tanstack/query-core";
import { createClient } from "@supabase/supabase-js";
import {
  Button,
  Checkbox,
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
  useToast,
} from "@chakra-ui/react";
import { AddIcon, CheckIcon, DeleteIcon } from "@chakra-ui/icons";
import Image from "next/image";
import Head from "next/head";
import { SITE_TITLE } from "constants/base";
import { CALCULATIONS_PRECISION, VOTE_CATEGORY_NAMES } from "constants/vote";
import { VoteCategory } from "types/vote";
import { useAtom } from "jotai";
import {
  candidateNameAtom,
  SELECTED_VOTERS_KEY,
  selectedVotersAtom,
} from "atom/vote";
import useVoteQuery from "network/useVoteQuery";

const MIN_VOTE = 0;
const MAX_VOTE = 10;

const Vote: NextPage = () => {
  const toast = useToast();
  const [candidateName, setCandidateName] = useAtom(candidateNameAtom);
  const [selectedVoters, setSelectedVoters] = useAtom(selectedVotersAtom);

  const { data: voters } = useVoterQuery.getVoters();
  const { mutate: vote, isLoading: isVoteLoading } = useVoteQuery.vote({
    onSuccess: () => {
      toast({
        title: "Voto salvato",
        description: "Il voto è stato salvato correttamente",
        status: "success",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
      handleClear(true);
    },
    onError: (error) => {
      toast({
        title: "Errore",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    },
  });

  const calculations = useMemo(() => {
    const averagesByCategory = Object.values(VoteCategory).reduce(
      (acc, category) => {
        const voters = Object.values(selectedVoters).filter(
          (selectedVoter) => selectedVoter.votes?.[category] !== undefined
        ).length;

        acc[category] = voters
          ? (
              Object.values(selectedVoters).reduce(
                (acc, voter) =>
                  acc + parseFloat(voter.votes?.[category] || "0"),
                0
              ) / voters
            ).toFixed(CALCULATIONS_PRECISION)
          : undefined;
        return acc;
      },
      {} as Record<VoteCategory, string | undefined>
    );

    const totalsByVoter = Object.entries(selectedVoters).reduce(
      (acc, [id, voter]) => ({
        ...acc,
        [id]:
          (voter.votes &&
            Object.values(voter.votes).some((vote) => !!vote) &&
            Object.values(voter.votes)
              .reduce((acc, vote) => acc + (vote ? parseFloat(vote) : 0), 0)
              .toFixed(CALCULATIONS_PRECISION)) ||
          undefined,
      }),
      {} as Record<string, string | undefined>
    );

    const laudeCount = Object.values(selectedVoters).filter(
      (selectedVoter) => !!selectedVoter.hasLaude
    ).length;

    const votersAverage = Object.values(averagesByCategory).some(
      (average) => average !== undefined
    )
      ? Object.values(averagesByCategory)
          .reduce(
            (acc, average) => acc + (average ? parseFloat(average) : 0),
            laudeCount
          )
          .toFixed(CALCULATIONS_PRECISION)
      : undefined;

    const chatsAverage =
      Object.values(selectedVoters).some(
        (selectedVoter) =>
          selectedVoter.chatVotes?.voters !== undefined &&
          selectedVoter.chatVotes?.positivePercentage !== undefined
      ) && votersAverage
        ? (
            Object.values(selectedVoters).reduce(
              (acc, voter) =>
                acc +
                (((voter.chatVotes?.voters || 0) *
                  parseFloat(voter.chatVotes?.positivePercentage || "0")) /
                  100) *
                  30,
              0
            ) /
            Object.values(selectedVoters).reduce(
              (acc, voter) => acc + (voter.chatVotes?.voters || 0),
              0
            )
          ).toFixed(CALCULATIONS_PRECISION)
        : undefined;

    const totalAverage =
      chatsAverage && votersAverage
        ? (
            (Object.values(totalsByVoter).reduce(
              (acc, average) => acc + (average ? parseFloat(average) : 0),
              laudeCount
            ) +
              parseFloat(chatsAverage)) /
            (Object.values(totalsByVoter).filter(
              (average) => average !== undefined
            ).length +
              1)
          ).toFixed(CALCULATIONS_PRECISION)
        : votersAverage;

    return {
      averagesByCategory,
      chatsAverage,
      totalsByVoter,
      votersAverage,
      totalAverage,
    };
  }, [selectedVoters]);

  const votersObject = useMemo(
    () =>
      voters?.reduce(
        (acc, voter) => {
          acc[voter.id] = voter;
          return acc;
        },
        {} as Record<string, Voter>
      ),
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
    if (
      typeof window !== "undefined" &&
      !localStorage.getItem(SELECTED_VOTERS_KEY) &&
      voters &&
      voters.length > 0 &&
      Object.values(selectedVoters).length === 0
    ) {
      setSelectedVoters({ [voters[0].id]: {} });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voters]);

  const resetSelectedVoters = (keepVoters?: boolean) => {
    if (!voters) {
      return {};
    }

    if (!keepVoters) {
      return {
        [voters[0].id]: {},
      };
    }

    return selectedVotersIds.reduce(
      (acc, id) => ({
        ...acc,
        [id]: {
          ...(selectedVoters[id].chatVotes ? { chatVotes: {} } : {}),
        },
      }),
      {}
    );
  };

  const handleClear = (keepVoters?: boolean) => {
    const newSelectedVoters = resetSelectedVoters(keepVoters);
    setSelectedVoters(newSelectedVoters);
    setCandidateName("");
  };

  const handleSave = () => {
    if (candidateName === "") {
      toast({
        title: "Errore",
        description: "Inserisci il nome del candidato",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
      });
    } else {
      vote({
        candidateName,
        vote: selectedVoters,
      });
    }
  };

  const getVoteNewValue = (value: string) => {
    if (value.startsWith("0") && !value.includes(".")) {
      return `${MIN_VOTE}`;
    }
    if (parseFloat(value || "0") <= MAX_VOTE) {
      return value;
    }
    return value.slice(0, value.length - 1);
  };

  return (
    <GlobalWrapper>
      <Head>
        <title>{`Vota - ${SITE_TITLE}`}</title>
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
        <Flex gap={2}>
          <Button onClick={() => handleClear()} size={"sm"} variant={"outline"}>
            <DeleteIcon mr={2} />
            Svuota tabella
          </Button>
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
                    {votersObject?.[voterId].name}
                  </MenuItem>
                ))}
              </MenuList>
            </Menu>
          )}
        </Flex>
      </Flex>
      <Table bg={useColorModeValue("white", "black")} borderRadius={"xl"}>
        <Thead>
          <Tr>
            <Th>
              <FormControl>
                <FormLabel textTransform={"unset"}>Nome candidato</FormLabel>
                <Input
                  onChange={(event) => setCandidateName(event.target.value)}
                  value={candidateName}
                />
              </FormControl>
            </Th>
            {votersObject &&
              selectedVotersIds.map((voterId) => (
                <Th key={voterId}>
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
          </Tr>
        </Thead>
        <Tbody>
          {Object.values(VoteCategory).map((category) => (
            <Tr key={category}>
              <Td>
                <Text fontWeight={"medium"}>
                  {VOTE_CATEGORY_NAMES[category]}
                </Text>
              </Td>
              {selectedVotersIds.map((voterId) => (
                <Td key={voterId}>
                  <NumberInput
                    min={MIN_VOTE}
                    max={MAX_VOTE}
                    onChange={(value) =>
                      setSelectedVoters((selectedVoters) => ({
                        ...selectedVoters,
                        [voterId]: {
                          ...selectedVoters[voterId],
                          votes: {
                            ...selectedVoters[voterId].votes,
                            [category]: getVoteNewValue(value),
                          },
                          hasLaude:
                            parseFloat(value || "0") <= MAX_VOTE && false,
                        },
                      }))
                    }
                    value={selectedVoters[voterId].votes?.[category] || ""}
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
              <Text fontWeight={"medium"}>Voto giudici (/30)</Text>
            </Td>
            {selectedVotersIds.map((voterId) => {
              const singleVote = calculations.totalsByVoter[voterId];
              return (
                <Td key={voterId}>
                  <Text align={"center"}>{singleVote}</Text>
                  {+(singleVote || 0) >= 30 && (
                    <Text align={"center"}>
                      lode{" "}
                      <Checkbox
                        isChecked={selectedVoters[voterId].hasLaude}
                        onChange={(e) =>
                          setSelectedVoters((selectedVoters) => ({
                            ...selectedVoters,
                            [voterId]: {
                              ...selectedVoters[voterId],
                              hasLaude: e.target.checked,
                            },
                          }))
                        }
                      />
                    </Text>
                  )}
                </Td>
              );
            })}
            <Td>
              <Text align={"center"}>{calculations.votersAverage}</Text>
            </Td>
          </Tr>
          <Tr>
            <Td>
              <Text fontWeight={"medium"}>Voto chat</Text>
            </Td>
            {selectedVotersIds.map((voterId) => (
              <Td key={voterId}>
                {selectedVoters[voterId].chatVotes ? (
                  <Flex direction={"column"} gap={2}>
                    <FormControl>
                      <FormLabel>Numero votanti</FormLabel>
                      <NumberInput
                        min={0}
                        onChange={(_, value) =>
                          setSelectedVoters((selectedVoters) => ({
                            ...selectedVoters,
                            [voterId]: {
                              ...selectedVoters[voterId],
                              chatVotes: {
                                ...selectedVoters[voterId].chatVotes,
                                voters: value,
                              },
                            },
                          }))
                        }
                        value={selectedVoters[voterId].chatVotes?.voters || ""}
                      >
                        <NumberInputField textAlign={"center"} />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                    <FormControl>
                      <FormLabel>Numero &quot;Si&quot; (in %)</FormLabel>
                      <NumberInput
                        min={0}
                        max={100}
                        onChange={(value) =>
                          setSelectedVoters((selectedVoters) => ({
                            ...selectedVoters,
                            [voterId]: {
                              ...selectedVoters[voterId],
                              chatVotes: {
                                ...selectedVoters[voterId].chatVotes,
                                positivePercentage: value,
                              },
                            },
                          }))
                        }
                        value={
                          selectedVoters[voterId].chatVotes
                            ?.positivePercentage || ""
                        }
                      >
                        <NumberInputField textAlign={"center"} />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </Flex>
                ) : (
                  <Flex alignItems={"center"} justifyContent={"center"}>
                    <Button
                      onClick={() =>
                        setSelectedVoters((selectedVoters) => ({
                          ...selectedVoters,
                          [voterId]: {
                            ...selectedVoters[voterId],
                            chatVotes: {},
                          },
                        }))
                      }
                      variant={"outline"}
                    >
                      <AddIcon mr={2} />
                      Aggiungi chat
                    </Button>
                  </Flex>
                )}
              </Td>
            ))}
            <Td>
              <Text align={"center"}>{calculations.chatsAverage}</Text>
            </Td>
          </Tr>
          <Tr>
            <Td border={"none"} colSpan={selectedVotersIds.length + 1}>
              <Text align={"right"} fontWeight={"medium"} fontSize={"2xl"}>
                Media totale
              </Text>
            </Td>
            <Td border={"none"}>
              <Text align={"center"} fontWeight={"medium"} fontSize={"2xl"}>
                {calculations.totalAverage}
              </Text>
            </Td>
          </Tr>
        </Tbody>
      </Table>
      <Flex mt={4} justifyContent={"right"}>
        <Button size={"lg"} isLoading={isVoteLoading} onClick={handleSave}>
          <CheckIcon mr={3} />
          Salva il voto
        </Button>
      </Flex>
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
