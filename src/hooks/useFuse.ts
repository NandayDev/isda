import { useState } from "react";
import Fuse from "fuse.js";

const fuzzySearch = <T>(data: T[], term: string, fuse: Fuse<T>) => {
  const result = fuse.search(`${term}`).map((fuseItem) => fuseItem.item);
  return term ? result : data;
};

const useFuse = <T>(data?: T[], options?: Fuse.IFuseOptions<T>) => {
  const [term, setTerm] = useState<string>("");

  const fuseOptions = {
    threshold: 0.2,
    ...options,
  };

  const fuse = new Fuse(data || [], fuseOptions);

  const result = fuzzySearch(data || [], term, fuse);

  const reset = () => setTerm("");

  return { result, search: setTerm, term, reset };
};

export default useFuse;
