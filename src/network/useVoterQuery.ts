import {
  MutationOptions,
  QueryOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import client from "network/utils/client";
import { AxiosError } from "axios";
import { Voter, VoterType } from "@prisma/client";

export const VOTERS_QUERY_KEY = "voters";

interface PostVoterPayload {
  name: string;
  type: VoterType;
  image?: string;
}

interface PutVoterPayload {
  id: string;
  name: string;
  type: VoterType;
  image?: string;
}

interface DeleteVoterPayload {
  id: string;
}

const useGetVoters = () => {
  return useQuery<Voter[], AxiosError>({
    queryKey: [VOTERS_QUERY_KEY],
    queryFn: () => client.get({ path: "/voters" }),
  });
};

const usePostVoter = (
  options?: MutationOptions<unknown, AxiosError, PostVoterPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError, PostVoterPayload>({
    mutationKey: [VOTERS_QUERY_KEY],
    mutationFn: (payload) => client.post({ path: "/voters", body: payload }),
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries([VOTERS_QUERY_KEY]);
      options?.onSuccess?.(data, variables, context);
    },
  });
};

const usePutVoter = (
  options?: MutationOptions<unknown, AxiosError, PutVoterPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError, PutVoterPayload>({
    mutationKey: [VOTERS_QUERY_KEY],
    mutationFn: ({ id, ...rest }) =>
      client.put({ path: `/voters/${id}`, body: rest }),
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries([VOTERS_QUERY_KEY]);
      options?.onSuccess?.(data, variables, context);
    },
  });
};

const useDeleteVoter = (
  options?: MutationOptions<unknown, AxiosError, DeleteVoterPayload>
) => {
  const queryClient = useQueryClient();

  return useMutation<unknown, AxiosError, DeleteVoterPayload>({
    mutationKey: [VOTERS_QUERY_KEY],
    mutationFn: ({ id }) => client.delete({ path: `/voters/${id}` }),
    ...options,
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries([VOTERS_QUERY_KEY]);
      options?.onSuccess?.(data, variables, context);
    },
  });
};

export default {
  getVoters: useGetVoters,
  postVoter: usePostVoter,
  putVoter: usePutVoter,
  deleteVoter: useDeleteVoter,
};
