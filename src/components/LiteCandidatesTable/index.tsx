import { FunctionComponent, useMemo } from "react";
import Table from "components/Table";
import { CandidateWithVotesAndCalculationsAndPosition } from "types/candidate";
import { Voter } from "@prisma/client";
import { createColumnHelper } from "@tanstack/table-core";
import { POSITION_EMOJI } from "constants/position";
import { Flex, Text } from "@chakra-ui/react";

interface LiteCandidatesTableProps {
  candidates: CandidateWithVotesAndCalculationsAndPosition[];
  voters: Voter[];
}

const columnHelper =
  createColumnHelper<CandidateWithVotesAndCalculationsAndPosition>();

const LiteCandidatesTable: FunctionComponent<LiteCandidatesTableProps> = ({
  candidates,
  voters,
}) => {
  const columns = useMemo(
    () => [
      columnHelper.accessor("position", {
        header: "P",
        cell: (props) => {
          if (
            Object.keys(POSITION_EMOJI).includes(props.getValue().toString())
          ) {
            return POSITION_EMOJI[props.getValue() as 1 | 2 | 3];
          } else {
            return props.getValue();
          }
        },
      }),
      columnHelper.accessor("name", {
        header: "Name",
        cell: (props) => <Text>{props.getValue()}</Text>,
      }),
      ...voters.map((voter) =>
        columnHelper.accessor(`calculations.totalsByVoter.${voter.id}`, {
          header: voter.name,
          cell: (props) => (
            <Text align={"center"}>
              {props.getValue() === "30.0" ? 30 : props.getValue()}
              {props.row.original.votes.map(
                (vote) => vote.voterId === voter.id && vote.hasLaude && "L"
              )}
            </Text>
          ),
        })
      ),
      columnHelper.accessor("calculations.chatsAverage", {
        header: "Media chat",
        cell: (props) => <Text align={"center"}>{props.getValue()}</Text>,
      }),
      columnHelper.accessor("calculations.totalAverage", {
        header: "Media",
        cell: (props) => (
          <Text align={"center"} fontWeight={"medium"} fontSize={"2xl"}>
            {props.getValue()}
          </Text>
        ),
      }),
    ],
    []
  );

  return (
    <Flex overflowX={"auto"}>
      <Table columns={columns} data={candidates} />
    </Flex>
  );
};

export default LiteCandidatesTable;
