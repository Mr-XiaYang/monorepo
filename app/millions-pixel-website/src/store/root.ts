import { PixelMapStore } from "./pixel_map";

export class RootStore {
  pixelMap: PixelMapStore;

  constructor() {
    this.pixelMap = new PixelMapStore(this);
  }
}
