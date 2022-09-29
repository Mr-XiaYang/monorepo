import { Buffer } from "buffer";
import { computed, keys, makeObservable, observable, runInAction, values } from "mobx";
import { BaseStore } from "./base";
import type { RootStore } from "./root";
import { colors } from "../utils/colors";


async function loadData(x: number, y: number) {
  const response = await fetch(`http://192.168.0.27:8080/board/bitmap/${x}/${y}`);
  const buffer = await response.arrayBuffer();
  return new Uint8Array(buffer);
}

export class PixelMapStore extends BaseStore {
  data: Record<string, {
    index: { x: number, y: number },
    position: { x: number, y: number },
    height: number, width: number, data: Uint8ClampedArray
  }>;

  get size(): {width:number, height: number} {
    const xList = values(this.data).map(({index}) => index.x);
    const yList = values(this.data).map(({index}) => index.y);
    return {
      width: 480 * (Math.max(...xList, 0) + Math.abs( Math.min(...xList, 0))),
      height: 270 * (Math.max(...yList, 0) + Math.abs( Math.min(...yList, 0)))
    };
  }

  constructor(root: RootStore) {
    super(root);
    this.data = {};
    makeObservable(this, {
      data: observable,
      size: computed,
    });
  }

  loadPixelMap(x: number, y: number) {
    loadData(x, y).then((buffer) => {
      const imageBuffer = new Uint8ClampedArray(
        new Uint32Array(buffer.length).map((_, index) => {
          const color = colors[buffer[index]];
          return parseInt(`${color.slice(1, 3)}${color.slice(3, 5)}${color.slice(5, 7)}ff`, 16);
        }).buffer);
      runInAction(() => {
        this.data[`${x},${y}`] = {
          index: {x, y},
          position: {
            x: x * 480 - (x > 0 ? 480 : 0),
            y: -(y * 270 + (y < 0 ? 270 : 0)),
          },
          width: 480, height: 270, data: imageBuffer,
        };
        console.log(this.size);
      });
    }).catch((error) => {
      console.log(error);
    });
  }
}
