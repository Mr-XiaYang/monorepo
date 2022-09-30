import { action, computed, makeObservable, observable, runInAction } from "mobx";
import { colors } from "../utils/colors";
import { BaseStore } from "./base";
import type { RootStore } from "./root";


async function loadData(index: number) {
  const response = await fetch(`http://localhost:8080/board/bitmap/${index}`);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

export class PixelMapStore extends BaseStore {
  scale: number;
  width: number;
  height: number;
  pointerPosition: null | {
    x: number
    y: number
  };
  data: Record<number, ArrayBuffer>;
  private maxScale: number = 60;
  private minScale: number = 4;

  constructor(root: RootStore) {
    super(root);
    this.scale = 1;
    this.width = 1920;
    this.height = 1080;
    this.pointerPosition = null;
    this.data = {};
    makeObservable(this, {
      scale: observable,
      pointerPosition: observable,
      data: observable,
      isDrawable: computed,
      updateScale: action.bound,
      updatePointerPosition: action.bound,
    });
    this.loadPixelMap(1);
  }

  get isDrawable(): boolean {
    return this.scale === this.maxScale && this.pointerPosition != null;
  }

  updateScale(increment: boolean) {
    this.scale = Math.min(Math.max(this.scale + (increment ? 1 : -1), this.minScale), this.maxScale);
  }

  updatePointerPosition(x: number, y: number) {
    if (x <= this.width / 2 && x >= -(this.width / 2) && y <= this.height / 2 && y >= -(this.height / 2)) {
      this.pointerPosition = {x, y};
    } else {
      this.pointerPosition = null;
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
          this.pointerPosition = null;
          this.updateScale(true);
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
