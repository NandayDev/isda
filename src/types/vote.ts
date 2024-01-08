export type VoteData = {
  [category in VoteCategory]: string;
};

export type ChatVoteData = { voters: number; positivePercentage: string };

export interface Vote {
  [voterId: string]: {
    chatVotes?: Partial<ChatVoteData>;
    votes?: Partial<VoteData>;
    hasLaude?: boolean;
  };
}

export interface VotePayload {
  candidateName: string;
  vote: Vote;
}

export enum VoteCategory {
  CasePresentation = "casePresentation",
  AssetAllocation = "assetAllocation",
  GoalsAdherence = "goalsAdherence",
}
