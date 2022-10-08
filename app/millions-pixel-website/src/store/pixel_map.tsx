import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { colors } from "../utils/colors";
import { BaseStore } from "./base";
import type { RootStore } from "./root";


async function loadData(index: number) {
  const response = await fetch(`http://192.168.0.27:8080/board/bitmap/${index}`);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

export class PixelMapStore extends BaseStore {


  scale: number;
  minScale: number = 4;
  maxScale: number = 40;
  width: number;
  height: number;
  viewport: {
    width: number;
    height: number
  }
  focusPosition: null | {
    x: number
    y: number
  };
  data: Record<number, ArrayBuffer>;

  constructor(root: RootStore) {
    super(root);
    this.scale = 1;
    this.width = 1920;
    this.height = 1080;
    this.viewport = { width: 0, height: 0 };
    this.focusPosition = null;
    this.data = {};
    makeObservable(this, {
      scale: observable,
      minScale: false,
      maxScale: false,
      viewport: observable,
      focusPosition: observable,
      data: observable,
      isDrawable: computed,
      updateScale: action.bound,
      updateViewPort: action.bound,
      updateFocusPosition: action.bound,
    });
    this.loadPixelMap(1);
  }

  get isDrawable(): boolean {
    return this.scale === this.maxScale && this.focusPosition != null;
  }

  updateScale(scale: number) {
    this.scale = Math.min(Math.max(scale, this.minScale), this.maxScale);
  }

  updateViewPort(width: number, height: number) {
    this.viewport = { width, height };
  }

  updateFocusPosition(x: number, y: number) {
    if (x <= this.width / 2 && x >= -(this.width / 2) && y <= this.height / 2 && y >= -(this.height / 2)) {
      this.focusPosition = {x, y};
    } else {
      this.focusPosition = null;
    }
  }

  loadPixelMap(index: number) {
    loadData(index).then((buffer) => {
      runInAction(() => {
        this.scale = this.maxScale;
        this.data[`${index}`] = new Uint32Array(buffer.length).map((_, index) => {
          const color: string = colors[buffer[index]];
          return parseInt(`ff${color.slice(5, 7)}${color.slice(3, 5)}${color.slice(1, 3)}`, 16);
        }).buffer;
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
  }
}
