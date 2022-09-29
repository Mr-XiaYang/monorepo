import { useContext } from "react";
import { RootStoreContext } from "../context";
import { RootStore } from "../store";

export function useStore(): RootStore {
  const rootStore = useContext(RootStoreContext);
  if (rootStore == null) {
    throw new Error("The root store is not fount.");
  }
  return rootStore;
}
