import {
  MutationOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import client from "network/utils/client";
import { CandidateWithVotes, DeleteVotePayload } from "types/candidate";
import { Candidate } from "@prisma/client";
import { AxiosError } from "axios";

export const CANDIDATES_QUERY_KEY = "candidates";

const useGetAll = () => {
  return useQuery<CandidateWithVotes[]>({
    queryKey: [CANDIDATES_QUERY_KEY],
    queryFn: () => client.get({ path: "/candidates" }),
  });
};

const useDelete = (
  options?: MutationOptions<Candidate, AxiosError, DeleteVotePayload>
) => {
  const queryClient = useQueryClient();

  return useMutation<Candidate, AxiosError, DeleteVotePayload>({
    mutationKey: [CANDIDATES_QUERY_KEY],
    mutationFn: ({ candidateId }) =>
      client.delete({ path: `/candidates/${candidateId}` }),
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries([CANDIDATES_QUERY_KEY]);
      options?.onSuccess?.(data, variables, context);
    },
  });
};

export default { getAll: useGetAll, delete: useDelete };
