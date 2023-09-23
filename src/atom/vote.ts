import { atomWithStorage } from "jotai/utils";
import { LOCALSTORAGE_NAMESPACE } from "constants/local-storage";
import { Vote } from "types/vote";

export const SELECTED_VOTERS_KEY = `${LOCALSTORAGE_NAMESPACE}/vote/selectedVoters`;

export const candidateNameAtom = atomWithStorage<string>(
  `${LOCALSTORAGE_NAMESPACE}/vote/candidateName`,
  ""
);

export const selectedVotersAtom = atomWithStorage<Vote>(
  `${LOCALSTORAGE_NAMESPACE}/vote/selectedVoters`,
  {}
);
