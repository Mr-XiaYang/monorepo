import { action, computed, makeObservable, observable, runInAction, when } from "mobx";
import { colors } from "../config";
import { BaseStore } from "./base";
import type { RootStore } from "./root";


async function loadData(worldId: string) {
  const response = await fetch(`http://localhost:8080/board/bitmap/${worldId}`);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

const webSocket = new WebSocket("ws://localhost:8080/board/bitmap/${worldId}");

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
  pixels: Array<{ worldId: string, x: number, y: number, color: number }>;

  constructor(root: RootStore) {
    super(root);
    this.scale = 1;
    this.width = 1920;
    this.height = 1080;
    this.viewport = {width: 0, height: 0};
    this.focusPosition = null;
    this.bitmap = {};
    this.pixels = [];
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
      loadPixelMap: action.bound,
      // updatePixelMap: action.bound,
    });

    when(() => this.pixels.length > 0, () => {
      while (this.pixels.length > 0) {
        const pixel = this.pixels.shift();
        console.log(pixel?.x, pixel?.y);
      }
    });

    const a = setInterval(() => {
      const x = Math.ceil(Math.random() * (this.width / 2));
      const y = Math.ceil(Math.random() * (this.height / 2));
      this.pixels.push({
        worldId: "1",
        x: Math.random() < 0.5 ? x : -x,
        y: Math.random() < 0.5 ? y : -y,
        color: Math.floor(Math.random() * 256),
      });
    }, 100);
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

  async loadPixelMap(worldId: string) {
    const bitmapData = await loadData(worldId);
    const bitmap = new Uint32Array(bitmapData.length).map((_, index) => {
      const color: string = colors[bitmapData[index]];
      return parseInt(`ff${color.slice(5, 7)}${color.slice(3, 5)}${color.slice(1, 3)}`, 16);
    });
    runInAction(() => this.bitmap[worldId] = bitmap);
  }

  async drawPixel(pixel: { worldId: string, x: number, y: number, color: number }) {
    if (this.bitmap[pixel.worldId] == null) {
      this.pixels.push(pixel);
    } else {
      const color: string = colors[pixel.color];
      const offset: number = -((pixel.y < 0 ? pixel.y + 1 : pixel.y) - 540) * 1920 + (960 + (pixel.x > 0 ? pixel.x - 1 : pixel.x));
      const value: number = parseInt(`ff${color.slice(5, 7)}${color.slice(3, 5)}${color.slice(1, 3)}`, 16);
      this.bitmap[pixel.worldId].set([value], offset);
    }

    // if (this.bitmap[worldId] && this.pixels[worldId].length > 0) {
    //   const startTime = Date.now();
    //   while (Date.now() - startTime < 2000) {
    //     const pixel = this.pixels[worldId].shift();
    //     if (pixel != null) {
    //
    //     } else {
    //       break;
    //     }
    //   }
    // }
  }
}
