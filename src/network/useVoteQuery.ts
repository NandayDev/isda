import { MutationOptions, useMutation } from "@tanstack/react-query";
import client from "network/utils/client";
import { AxiosError } from "axios";
import { VotePayload } from "types/vote";
import { CandidateWithVotes } from "types/candidate";

const VOTE_QUERY_KEY = "vote";

const useVote = (
  options?: MutationOptions<CandidateWithVotes, AxiosError, VotePayload>
) => {
  return useMutation<CandidateWithVotes, AxiosError, VotePayload>({
    mutationKey: [VOTE_QUERY_KEY],
    mutationFn: (payload) => client.post({ path: "/votes", body: payload }),
    ...options,
  });
};

export default { vote: useVote };
