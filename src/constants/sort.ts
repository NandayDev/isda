import { SortType } from "types/sort";

export const SORT_TEXT: { [type in SortType]: string } = {
  [SortType.VoteDesc]: "Voto (decrescente)",
  [SortType.VoteAsc]: "Voto (crescente)",
  [SortType.DateDesc]: "Data (decrescente)",
  [SortType.DateAsc]: "Data (crescente)",
  [SortType.NameDesc]: "Nome (decrescente)",
  [SortType.NameAsc]: "Nome (crescente)",
};
