import { useQuery } from "@tanstack/react-query";
import client from "network/utils/client";
import { CandidateWithVotes } from "types/candidate";

export const CANDIDATES_QUERY_KEY = "candidates";

const useGetAll = () => {
  return useQuery<CandidateWithVotes[]>({
    queryKey: [CANDIDATES_QUERY_KEY],
    queryFn: () => client.get({ path: "/candidates" }),
  });
};

export default { getAll: useGetAll };
