export enum VoteCategory {
  casePresentation = "case_presentation",
  assetAllocation = "asset_allocation",
  goalsAdherence = "goals_adherence",
}

export const VOTE_CATEGORY_NAMES = {
  [VoteCategory.casePresentation]: "Presentazione del caso",
  [VoteCategory.assetAllocation]: "Efficienza asset allocation",
  [VoteCategory.goalsAdherence]: "Aderenza obiettivi",
};
