import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { colors } from "../utils/colors";
import { BaseStore } from "./base";
import type { RootStore } from "./root";


async function loadData(worldId: string) {
  const response = await fetch(`http://192.168.0.27:8080/board/bitmap/${worldId}`);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

export class PixelMapStore extends BaseStore {


  scale: number;
  minScale: number = 1;
  maxScale: number = 40;
  width: number;
  height: number;
  viewport: {
    width: number;
    height: number
  };
  focusPosition: null | {
    x: number
    y: number
  };
  bitmap: {
    [worldId: string]: Uint32Array
  };
  pixels: Record<string, { worldId: string, x: number, y: number, color: number }[]>;

  constructor(root: RootStore) {
    super(root);
    this.scale = 1;
    this.width = 1920;
    this.height = 1080;
    this.viewport = {width: 0, height: 0};
    this.focusPosition = null;
    this.bitmap = {};
    this.pixels = {};
    makeObservable(this, {
      scale: observable,
      minScale: false,
      maxScale: false,
      viewport: observable,
      focusPosition: observable,
      bitmap: observable,
      pixels: observable,
      isDrawable: computed,
      updateScale: action.bound,
      updateViewPort: action.bound,
      updateFocusPosition: action.bound,
    });
  }

  get isDrawable(): boolean {
    return this.scale === this.maxScale && this.focusPosition != null;
  }

  updateScale(scale: number) {
    this.scale = Math.min(Math.max(scale, this.minScale), this.maxScale);
  }

  updateViewPort(viewport: { width: number, height: number }) {
    this.viewport = viewport;
  }

  updateFocusPosition(x?: number, y?: number) {
    if (x && y && x <= this.width / 2 && x >= -(this.width / 2) && y <= this.height / 2 && y >= -(this.height / 2)) {
      this.focusPosition = {x, y};
    } else {
      this.focusPosition = null;
    }
  }

  loadPixelMap(worldId: string) {
    loadData(worldId).then((buffer) => {
      runInAction(() => {
        this.scale = this.maxScale;
        this.bitmap[worldId] = new Uint32Array(buffer.length).map((_, index) => {
          const color: string = colors[buffer[index]];
          return parseInt(`ff${color.slice(5, 7)}${color.slice(3, 5)}${color.slice(1, 3)}`, 16);
        });
        const timeId = setInterval(() => runInAction(() => {
          this.focusPosition = null;
          this.updateScale(this.scale + 1);
          if (this.scale === this.maxScale) {
            clearInterval(timeId);
          }
        }), 20);
      });
    }).catch((error) => {
      console.log(error);
    });
    const a = setInterval(() => {
      if (!this.pixels[worldId]) this.pixels[worldId] = [];
      this.pixels[worldId].push({
        worldId: worldId,
        x: Math.ceil(Math.random() * (this.width / 2)),
        y: Math.ceil(Math.random() * (this.height / 2)),
        color: Math.floor(Math.random() * 256),
      });
    }, 1);
  }
}
