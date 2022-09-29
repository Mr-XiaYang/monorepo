import { Buffer } from "buffer";
import Konva from "konva";
import { autorun, reaction } from "mobx";
import { Observer } from "mobx-react";
import React, { useCallback, useEffect, useRef, useState } from "react";

import { Layer, Rect, Stage, Text, Image, Shape, Group } from "react-konva";
import { useStore } from "../../hooks";

export function MainStage() {
  const stageRef = useRef<Konva.Stage | null>(null);
  const pixelMapRef = useRef<Konva.Layer | null>(null);
  const {pixelMap} = useStore();
  useEffect(() => {
    pixelMap.loadPixelMap(-1, -1);
    pixelMap.loadPixelMap(-1, -2);
    pixelMap.loadPixelMap(-1, -3);
    pixelMap.loadPixelMap(-1, -4);
    const pixelMapSizeReactionDisposer = reaction(
      () => pixelMap.size,
      size => pixelMapRef.current?.size(size),
    );
    const pixelMapDataReactionDisposer = reaction(
      () => pixelMap.data,
      data => pixelMapRef.current?.getCanvas()
      .getContext()._context.putImageData(new ImageData())
    );
    return () => {
      pixelMapSizeReactionDisposer();
    };
    // if (stageRef.current != null) {
    //   // stageRef.current.absolutePosition({x: window.innerWidth / 2, y: window.innerHeight / 2});
    //   // stageRef.current?.getLayers().map((layer) => {
    //   //   layer.getCanvas().getContext()._context.imageSmoothingEnabled = false;
    //   // });
    //   // pixelMap.loadPixelMap(1, 1);
    //   // pixelMap.loadPixelMap(1, -1);
    //   // pixelMap.loadPixelMap(-1, 1);
    // }
  }, [stageRef.current]);

  const [images, setImages] = useState<{ x: number, y: number, data: HTMLCanvasElement }[]>([]);

  React.useEffect(() => {
    const horizontalIndex = new Array(Math.ceil(window.innerWidth / 2 / 480))
    .fill(undefined).map((_, index) => [index + 1, -(index + 1)]).flat();
    const verticalIndex = new Array(Math.ceil(window.innerHeight / 2 / 270))
    .fill(undefined).map((_, index) => [index + 1, -(index + 1)]).flat();
    // (async () => {
    //   const images: { x: number, y: number, data: HTMLCanvasElement }[] = [];
    //   for (let x of horizontalIndex) {
    //     for (let y of verticalIndex) {
    //       const response = await fetch(`http://192.168.0.27:8080/board/bitmap/${x}/${y}`);
    //       const buffer = await response.arrayBuffer();
    //       const bitmap = new Uint8ClampedArray(buffer);
    //       const imageData = new Uint32Array(buffer.byteLength).map((value, index) => (
    //         bitmap[index] > 0 ? Buffer.from(Uint32Array.of(255, 100, 100, 100)).readUInt32BE(0) : 0
    //       ));
    //       const canvas: HTMLCanvasElement = document.createElement("canvas");
    //       canvas.width = 480;
    //       canvas.height = 270;
    //       const canvasContext = canvas.getContext("2d")!;
    //       canvasContext.putImageData(
    //         new ImageData(new Uint8ClampedArray(imageData.buffer), 480, 270),
    //         0, 0,
    //       );
    //       images.push({x, y, data: canvas});
    //       setImages([...images]);
    //     }
    //   }
    // })();
  }, []);

  const wheelStage = useCallback(function (e: Konva.KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault();
    const maxScale = 40, minScale = 1, scaleStep = 1;
    const currentScale = Math.max(
      e.currentTarget.scaleX() ?? 1, e.currentTarget.scaleY() ?? 1,
    );
    if (e.evt.deltaX > 0 || e.evt.deltaY > 0 || e.evt.deltaZ > 0) {
      e.currentTarget.scaleX(Math.max(currentScale - scaleStep, minScale));
      e.currentTarget.scaleY(Math.max(currentScale - scaleStep, minScale));
    } else {
      e.currentTarget.scaleX(Math.min(currentScale + scaleStep, maxScale));
      e.currentTarget.scaleY(Math.min(currentScale + scaleStep, maxScale));
    }
  }, []);

  const mouseMoveLayer = useCallback(function (e: Konva.KonvaEventObject<MouseEvent>) {
    e.evt.preventDefault();
    const {x, y} = e.currentTarget.getRelativePointerPosition();
    // console.log(Math.floor(x > 0 ? x + 1 : x), Math.floor(y > 0 ? y + 1 : y));
  }, []);

  return (
    <Stage
      scaleX={40} scaleY={40}
      ref={stageRef}
      draggable
      onWheel={wheelStage}
      onMouseMove={mouseMoveLayer}
      width={window.innerWidth}
      height={window.innerHeight}
    >
      <Layer>
        <Rect x={-2} y={-2} height={4} width={4} fill="red" />
        <Group>
          {images.map(({x, y, data}) => {
            const dx: number = x * 480 - (x > 0 ? 480 : 0);
            const dy: number = y * 270 + (y < 0 ? 270 : 0);
            return (<Image key={`${x}:${y}`} x={dx} y={-dy} image={data} />);
          })}
        </Group>
      </Layer>
      <Layer ref={pixelMapRef} />
    </Stage>
  );
}
