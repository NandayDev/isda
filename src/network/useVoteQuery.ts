import { MutationOptions, useMutation } from "@tanstack/react-query";
import client from "network/utils/client";
import { Prisma } from "@prisma/client";
import { AxiosError } from "axios";
import { VotePayload } from "types/vote";

const VOTE_QUERY_KEY = "vote";

const useVote = (
  options?: MutationOptions<
    Prisma.CandidateGetPayload<{ include: { votes: true } }>,
    AxiosError,
    VotePayload
  >
) => {
  return useMutation<
    Prisma.CandidateGetPayload<{ include: { votes: true } }>,
    AxiosError,
    VotePayload
  >({
    mutationKey: [VOTE_QUERY_KEY],
    mutationFn: (payload) => client.post({ path: "/vote", body: payload }),
    ...options,
  });
};

export default { vote: useVote };
