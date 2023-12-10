import { FunctionComponent, useState } from "react";
import {
  Button,
  Flex,
  Modal,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
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
import Image from "next/image";
import { Voter } from "@prisma/client";
import { ChatVoteData, VoteCategory, VoteData } from "types/vote";
import { VOTE_CATEGORY_NAMES } from "constants/vote";
import { CandidateWithVotesAndCalculationsAndPosition } from "types/candidate";
import { DeleteIcon } from "@chakra-ui/icons";
import useCandidateQuery from "network/useCandidateQuery";
import useSupabaseQuery from "network/useSupabaseQuery";
import { POSITION_EMOJI } from "constants/position";

interface CandidateTableProps {
  candidate: CandidateWithVotesAndCalculationsAndPosition;
  voters: Voter[];
}

const FIRST_COLUMN_WIDTH_PERCENTAGE = 25;
const LAST_COLUMN_WIDTH_PERCENTAGE = 15;

const CandidateTable: FunctionComponent<CandidateTableProps> = ({
  candidate,
  voters,
}) => {
  const toast = useToast();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const columnWidth = `${
    (100 - FIRST_COLUMN_WIDTH_PERCENTAGE - LAST_COLUMN_WIDTH_PERCENTAGE) /
    candidate.votes.length
  }%`;

  const { data: session } = useSupabaseQuery.getSession();

  const isLoggedIn = !!session?.data.session;

  const { mutate: deleteCandidate, isLoading: isDeleteCandidateLoading } =
    useCandidateQuery.delete({
      onSuccess: () => {
        handleCloseDeleteModal();
        toast({
          title: "Candidato eliminato",
          description: "Il candidato è stato eliminato correttamente",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: "top",
        });
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

  const votersObject = voters.reduce(
    (acc, voter) => {
      acc[voter.id] = voter;
      return acc;
    },
    {} as Record<string, Voter>
  );

  const handleOpenDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
  };

  const handleDeleteCandidate = () => {
    deleteCandidate({ candidateId: candidate.id });
  };

  return (
    <>
      <Table bg={useColorModeValue("white", "black")}>
        <Thead>
          <Tr>
            <Th fontSize={"lg"} w={`${FIRST_COLUMN_WIDTH_PERCENTAGE}%`}>
              <Flex alignItems={"center"} gap={2}>
                <Text lineHeight={5}>
                  {Object.keys(POSITION_EMOJI).includes(
                    candidate.position.toString()
                  )
                    ? POSITION_EMOJI[candidate.position as 1 | 2 | 3]
                    : `P${candidate.position}`}{" "}
                  | {candidate.name}: {candidate.calculations.totalAverage}
                </Text>
                {isLoggedIn && (
                  <DeleteIcon
                    fontSize={"sm"}
                    color={"red"}
                    cursor={"pointer"}
                    onClick={handleOpenDeleteModal}
                  />
                )}
              </Flex>
            </Th>
            {candidate.votes.map(({ voterId }) => {
              const voter = votersObject[voterId];

              return (
                <Th key={voter.id} w={columnWidth}>
                  <Flex alignItems={"center"} direction={"column"} gap={2}>
                    {voter.image && (
                      <Image
                        src={voter.image}
                        alt={voter.name}
                        width={50}
                        height={50}
                      />
                    )}
                    {votersObject[voterId].name}
                  </Flex>
                </Th>
              );
            })}
            <Th w={`${LAST_COLUMN_WIDTH_PERCENTAGE}%`}>
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
              {candidate.votes.map(({ voterId }) => {
                const voter = votersObject[voterId];

                return (
                  <Td key={voter.id}>
                    <Text align={"center"}>
                      {
                        (
                          candidate.votes.find(
                            (vote) => vote.voterId === voter.id
                          )?.voteData as VoteData
                        )[category]
                      }
                    </Text>
                  </Td>
                );
              })}
              <Td>
                <Text align={"center"}>
                  {candidate.calculations.averagesByCategory[category]}
                </Text>
              </Td>
            </Tr>
          ))}
          <Tr>
            <Td>
              <Text fontWeight={"medium"}>Voto giudici</Text>
            </Td>
            {candidate.votes.map(({ voterId }) => {
              const voter = votersObject[voterId];
              return (
                <Td key={voter.id}>
                  <Text align={"center"}>
                    {candidate.calculations.totalsByVoter[voter.id]}
                  </Text>
                </Td>
              );
            })}
            <Td>
              <Text align={"center"}>
                {candidate.calculations.votersAverage}
              </Text>
            </Td>
          </Tr>
          {candidate.votes.some((vote) => vote.chatVoteData) && (
            <Tr>
              <Td>
                <Text fontWeight={"medium"}>Voto chat</Text>
              </Td>
              {candidate.votes.map(({ voterId }) => {
                const voter = votersObject[voterId];
                return (
                  <Td key={voter.id}>
                    {candidate.votes.find((vote) => vote.voterId === voter.id)
                      ?.chatVoteData && (
                      <Text align={"center"}>
                        {
                          (
                            candidate.votes.find(
                              (vote) => vote.voterId === voter.id
                            )?.chatVoteData as ChatVoteData
                          )?.positivePercentage
                        }
                        % 👍 su{" "}
                        {
                          (
                            candidate.votes.find(
                              (vote) => vote.voterId === voter.id
                            )?.chatVoteData as ChatVoteData
                          )?.voters
                        }{" "}
                        voti
                      </Text>
                    )}
                  </Td>
                );
              })}
              <Td>
                <Text align={"center"}>
                  {candidate.calculations.chatsAverage}
                </Text>
              </Td>
            </Tr>
          )}
          <Tr>
            <Td>
              <Flex alignItems={"center"} gap={2}>
                <Text fontSize={"sm"}>
                  Inserito il{" "}
                  {new Date(candidate.createdAt).toLocaleDateString("it", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  })}{" "}
                  alle ore{" "}
                  {new Date(candidate.createdAt).toLocaleTimeString("it")}
                </Text>
              </Flex>
            </Td>
            <Td colSpan={candidate.votes.length}>
              <Text align={"right"} fontWeight={"medium"} fontSize={"2xl"}>
                Media totale
              </Text>
            </Td>
            <Td>
              <Text align={"center"} fontWeight={"medium"} fontSize={"2xl"}>
                {candidate.calculations.totalAverage}
              </Text>
            </Td>
          </Tr>
        </Tbody>
      </Table>
      <Modal
        isCentered
        isOpen={showDeleteModal}
        onClose={handleCloseDeleteModal}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Sei sicuro di eliminare {candidate.name}?</ModalHeader>
          <ModalCloseButton />
          <ModalFooter gap={2}>
            <Button variant={"ghost"} onClick={handleCloseDeleteModal}>
              Chiudi
            </Button>
            <Button
              colorScheme={"red"}
              isLoading={isDeleteCandidateLoading}
              onClick={handleDeleteCandidate}
            >
              Elimina
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default CandidateTable;
