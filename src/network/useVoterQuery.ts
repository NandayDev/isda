import { MutationOptions, useMutation } from "@tanstack/react-query";
import client from "network/utils/client";
import { AxiosError } from "axios";
import { VoterType } from "@prisma/client";

const VOTERS_QUERY_KEY = "voters";

interface PostVoterPayload {
  name: string;
  type: VoterType;
  image?: string;
}

const usePostVoter = (
  options?: MutationOptions<unknown, AxiosError, PostVoterPayload>
) => {
  return useMutation<unknown, AxiosError, PostVoterPayload>({
    mutationKey: [VOTERS_QUERY_KEY],
    mutationFn: (payload) => client.post({ path: "/voter", body: payload }),
    ...options,
  });
};

export default { postVoter: usePostVoter };
