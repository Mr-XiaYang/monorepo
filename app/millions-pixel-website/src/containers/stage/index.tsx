import { Buffer } from "buffer";
import Konva from "konva";
import { useLocalObservable } from "mobx-react";
import React, { Fragment, useCallback, useEffect, useRef, useState } from "react";
import { Observer } from "mobx-react";

import { Layer, Rect, Stage, Text, Image, Shape } from "react-konva";


export function MainStage() {
  const stageRef = useRef<Konva.Stage | null>(null);

  useEffect(() => {
    if (stageRef.current != null) {
      stageRef.current.absolutePosition({x: window.innerWidth / 2, y: window.innerHeight / 2});
      stageRef.current?.getLayers().map((layer) => {
        layer.getCanvas().getContext()._context.imageSmoothingEnabled = false;
      });
    }
  }, [stageRef.current]);

  const [image, setImage] = useState<HTMLCanvasElement | null>(null);
  React.useEffect(() => {
    fetch("http://127.0.0.1:8080/board/bitmap/1-1").then((
      response,
    ) => {
      response.arrayBuffer().then((buffer) => {
        const bitmap = new Uint8ClampedArray(buffer);
        const imageData = new Uint32Array(buffer.byteLength).map((value, index) => {
          return (
            bitmap[index] > 0 ? Buffer.from(Uint32Array.of(255, 100, 100, 100)).readUInt32BE(0) : 0
          );
        });
        const canvas: HTMLCanvasElement = document.createElement("canvas");
        const canvasContext = canvas.getContext("2d")!;
        canvasContext.putImageData(
          new ImageData(new Uint8ClampedArray(imageData.buffer), 480, 270),
          0, 0,
        );
        setImage(canvas);
      });
    });
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

  return (
    <Stage
      ref={stageRef}
      draggable
      onWheel={wheelStage}
      width={window.innerWidth} height={window.innerHeight}
    >
      <Layer>
        <Rect x={0} y={0} height={4} width={4} fill="red" />
        {image && (
          <Image x={0} y={0} image={image} />
        )}
      </Layer>
    </Stage>
  );
}
