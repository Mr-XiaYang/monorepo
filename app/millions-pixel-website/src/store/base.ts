import { makeObservable } from "mobx";
import type { RootStore } from "./root";

export abstract class BaseStore {
  protected root: RootStore;

  protected constructor(root: RootStore) {
    this.root = root;
    makeObservable<BaseStore, "root">(this, {root: false});
  }
}
