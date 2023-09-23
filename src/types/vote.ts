export interface Vote {
  [voterId: string]: {
    chatVotes?: { voters?: number; positivePercentage?: string };
    votes?: { [category in VoteCategory]?: string };
  };
}

export interface VotePayload {
  candidateName: string;
  vote: Vote;
}

export enum VoteCategory {
  casePresentation = "case_presentation",
  assetAllocation = "asset_allocation",
  goalsAdherence = "goals_adherence",
}
