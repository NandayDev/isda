import { FunctionComponent } from "react";
import {
  Flex,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useColorModeValue,
} from "@chakra-ui/react";
import Image from "next/image";
import { Voter } from "@prisma/client";
import { CandidateWithVotes } from "types/candidate";
import { ChatVoteData, VoteCategory, VoteData } from "types/vote";
import { VOTE_CATEGORY_NAMES } from "constants/vote";

interface CandidateTableProps {
  candidate: CandidateWithVotes & {
    calculations: {
      averagesByCategory: Record<VoteCategory, string>;
      totalsByVoter: Record<string, string>;
      votersAverage: string;
      chatsAverage: string;
      totalAverage: string;
    };
  };
  voters: Voter[];
}

const CandidateTable: FunctionComponent<CandidateTableProps> = ({
  candidate,
  voters,
}) => {
  console.log(candidate);

  return (
    <Table bg={useColorModeValue("white", "black")}>
      <Thead>
        <Tr>
          <Th fontSize={"lg"}>
            {candidate.name}: {candidate.calculations.totalAverage}
          </Th>
          {voters.map((voter) => (
            <Th key={voter.id}>
              <Flex alignItems={"center"} direction={"column"} gap={2}>
                {voter.image && (
                  <Image
                    src={voter.image}
                    alt={voter.name}
                    width={50}
                    height={50}
                  />
                )}
                {voter.name}
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
              <Text fontWeight={"medium"}>{VOTE_CATEGORY_NAMES[category]}</Text>
            </Td>
            {voters.map((voter) => (
              <Td key={voter.id}>
                <Text align={"center"}>
                  {
                    (
                      candidate.votes.find((vote) => vote.voterId === voter.id)
                        ?.voteData as VoteData
                    )[category]
                  }
                </Text>
              </Td>
            ))}
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
          {voters.map((voter) => (
            <Td key={voter.id}>
              <Text align={"center"}>
                {candidate.calculations.totalsByVoter[voter.id]}
              </Text>
            </Td>
          ))}
          <Td>
            <Text align={"center"}>{candidate.calculations.votersAverage}</Text>
          </Td>
        </Tr>
        <Tr>
          <Td>
            <Text fontWeight={"medium"}>Voto chat</Text>
          </Td>
          {voters.map((voter) => (
            <Td key={voter.id}>
              {candidate.votes.find((vote) => vote.voterId === voter.id)
                ?.chatVoteData && (
                <Text align={"center"}>
                  {
                    (
                      candidate.votes.find((vote) => vote.voterId === voter.id)
                        ?.chatVoteData as ChatVoteData
                    )?.positivePercentage
                  }
                  % 👍 su{" "}
                  {
                    (
                      candidate.votes.find((vote) => vote.voterId === voter.id)
                        ?.chatVoteData as ChatVoteData
                    )?.voters
                  }{" "}
                  voti
                </Text>
              )}
            </Td>
          ))}
          <Td>
            <Text align={"center"}>{candidate.calculations.chatsAverage}</Text>
          </Td>
        </Tr>
        <Tr>
          <Td colSpan={voters.length + 1}>
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
  );
};

export default CandidateTable;
