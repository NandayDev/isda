import { VoteCategory } from "types/vote";
import { atomWithStorage } from "jotai/utils";
import { LOCALSTORAGE_NAMESPACE } from "constants/local-storage";

export const SELECTED_VOTERS_KEY = `${LOCALSTORAGE_NAMESPACE}/vote/selectedVoters`;

export const candidateNameAtom = atomWithStorage<string>(
  `${LOCALSTORAGE_NAMESPACE}/vote/candidateName`,
  ""
);

export const selectedVotersAtom = atomWithStorage<
  Record<
    string,
    {
      chatVotes?: { voters?: number; positivePercentage?: string };
      votes?: { [category in VoteCategory]?: string };
    }
  >
>(`${LOCALSTORAGE_NAMESPACE}/vote/selectedVoters`, {});
