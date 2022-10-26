import { action, computed, makeObservable, observable } from "mobx";
import { colors } from "../config";
import { BaseStore } from "./base";
import type { RootStore } from "./root";


async function loadData(worldId: string) {
  const response = await fetch(`http://localhost:8080/board/bitmap/${worldId}`);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

function pixelMapListener(worldId: string) {

}

const api = {
  loadBitMap() {
  },
  bitmapListener() {},
  drawPixel() {
  },
};


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
      // setPixelMap: action.bound,
      // updatePixelMap: action.bound,
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

  loadPixelMap(worldId: string, data: Uint8Array) {
    this.bitmap[worldId] = new Uint32Array(data.length).map((_, index) => {
      const color: string = colors[data[index]];
      return parseInt(`ff${color.slice(5, 7)}${color.slice(3, 5)}${color.slice(1, 3)}`, 16);
    });
    let pixel = this.pixels[worldId].shift();
    while (!!pixel) {
      const color: string = colors[pixel.color];
      const offset: number = -((pixel.y < 0 ? pixel.y + 1 : pixel.y) - 540) * 1920 + (960 + (pixel.x > 0 ? pixel.x - 1 : pixel.x));
      const value: number = parseInt(`ff${color.slice(5, 7)}${color.slice(3, 5)}${color.slice(1, 3)}`, 16);
      this.bitmap[pixel.worldId].set([value], offset);
      pixel = this.pixels[worldId].shift();
    }
    const pixels = this.pixels[worldId];
    delete this.pixels[worldId];

  }

  updatePixel() {
    if (this) {
    }
  }


  async drawPixel(pixel: { worldId: string, x: number, y: number, color: number }) {

    const color: string = colors[pixel.color];
    const offset: number = -((pixel.y < 0 ? pixel.y + 1 : pixel.y) - 540) * 1920 + (960 + (pixel.x > 0 ? pixel.x - 1 : pixel.x));
    const prevValue = this.bitmap[pixel.worldId][offset];
    const value: number = parseInt(`ff${color.slice(5, 7)}${color.slice(3, 5)}${color.slice(1, 3)}`, 16);
    this.bitmap[pixel.worldId].set([value], offset);

    try {
      // 更新服务端
    } catch (error) {
      this.bitmap[pixel.worldId].set([prevValue], offset);
    }
  }
}
