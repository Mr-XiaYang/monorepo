import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { autorun, keys } from "mobx";
import { Observer } from "mobx-react";
import React, { useCallback, useEffect, useRef } from "react";

import { Image, Layer, Rect, Stage } from "react-konva";
import { useStore } from "../../hooks";

Konva.hitOnDragEnabled = true;
export const MainStage = () => {
  const {pixelMap} = useStore();
  const stageRef = useRef<Konva.Stage | null>(null);

  useEffect(() => {
    stageRef.current?.move({
      x: Math.floor(window.innerWidth / 2), y: Math.floor(window.innerHeight / 2),
    });
    pixelMap.loadPixelMap(1);
    pixelMap.updateViewPort(
      window.innerWidth || document.documentElement.clientWidth
      || document.getElementsByTagName("body")[0].clientWidth,
      window.innerHeight || document.documentElement.clientHeight
      || document.getElementsByTagName("body")[0].clientHeight,
    );

    const disposers = [
      autorun(() => {
        stageRef.current?.scaleX(pixelMap.scale);
        stageRef.current?.scaleY(pixelMap.scale);
      }),
      autorun(() => {
        stageRef.current?.width(pixelMap.viewport.width);
        stageRef.current?.height(pixelMap.viewport.height);
      }),
    ];
    return () => {
      disposers.forEach(disposer => disposer());
    };
  }, []);

  useEffect(() => {
    const resize = () => pixelMap.updateViewPort(
      window.innerWidth || document.documentElement.clientWidth
      || document.getElementsByTagName("body")[0].clientWidth,
      window.innerHeight || document.documentElement.clientHeight
      || document.getElementsByTagName("body")[0].clientHeight,
    );
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [pixelMap]);

  const scaleHandler = useCallback(function (e: Konva.KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault();
    const direction = e.evt.deltaX < 0 || e.evt.deltaY < 0 || e.evt.deltaZ < 0;
    const oldScale = pixelMap.scale;
    const newScale = direction
      ? Math.min(pixelMap.scale + 0.2, pixelMap.maxScale)
      : Math.max(pixelMap.scale - 0.2, pixelMap.minScale);
    if (newScale != oldScale) {
      let newPoint;
      const pointer = stageRef.current?.getPointerPosition();
      if (pointer) {
        const mousePointTo = {
          x: (pointer.x - stageRef.current!.x()) / oldScale,
          y: (pointer.y - stageRef.current!.y()) / oldScale,
        };
        newPoint = {
          x: pointer.x - mousePointTo.x * newScale,
          y: pointer.y - mousePointTo.y * newScale,
        };
      }
      pixelMap.updateScale(newScale);
      newPoint && stageRef.current?.position(newPoint);
      stageRef.current?.absolutePosition(
        dragBoundHandler(stageRef.current?.absolutePosition()),
      );
    }
  }, [pixelMap]);

  const lastDist = useRef<number | undefined>();
  const lastCenter = useRef<{ x: number, y: number } | undefined>();
  const gestureHandler = useCallback(function (e: Konva.KonvaEventObject<TouchEvent>) {
    if (stageRef.current && e.evt.touches.length === 2) {
      e.evt.preventDefault();
      const [touch1, touch2] = e.evt.touches;
      if (stageRef.current.isDragging()) {
        stageRef.current.stopDrag();
      }
      const center = {
        x: (touch1.clientX + touch2.clientX) / 2,
        y: (touch1.clientY + touch2.clientY) / 2,
      };
      if (!lastCenter.current) {
        lastCenter.current = center;
        return;
      }

      const dist = Math.sqrt(Math.pow(touch2.clientX - touch1.clientX, 2) + Math.pow(touch2.clientY - touch1.clientY, 2));
      if (!lastDist.current) {
        lastDist.current = dist;
        return;
      }

      const pointTo = {
        x: (center.x - stageRef.current!.x()) / pixelMap.scale,
        y: (center.y - stageRef.current!.y()) / pixelMap.scale,
      };
      const newPoint = {
        x: center.x - pointTo.x * pixelMap.scale + center.x - lastCenter.current.x,
        y: center.y - pointTo.y * pixelMap.scale + center.y - lastCenter.current.y,
      };
      const newScale = pixelMap.scale * (dist / lastDist.current);

      lastDist.current = dist;
      lastCenter.current = center;
      pixelMap.updateScale(newScale);
      stageRef.current.position(newPoint);
      stageRef.current.absolutePosition(
        dragBoundHandler(stageRef.current.absolutePosition()),
      );
    }
  }, [pixelMap]);
  const gestureEndHandler = useCallback(function (e: Konva.KonvaEventObject<TouchEvent>) {
    lastDist.current = undefined;
    lastCenter.current = undefined;
  }, []);
  const dragBoundHandler = useCallback(function (pos: Vector2d): Vector2d {
    const dragDistanceX = pixelMap.width / 2 + 5;
    const dragDistanceY = pixelMap.height / 2 + 5;
    const maxX = dragDistanceX * pixelMap.scale;
    const minX = -(dragDistanceX * pixelMap.scale) + pixelMap.viewport.width;
    const maxY = dragDistanceY * pixelMap.scale;
    const minY = -(dragDistanceY * pixelMap.scale) + pixelMap.viewport.height;
    return {
      x: pos.x >= maxX ? maxX : pos.x <= minX ? minX : pos.x,
      y: pos.y >= maxY ? maxY : pos.y <= minY ? minY : pos.y,
    };
  }, [pixelMap]);

  const focusHandler = useCallback(function (e: Konva.KonvaEventObject<Event>) {
    e.evt.preventDefault();
    const pointer = stageRef.current?.absolutePosition();
    console.log(pointer);
    const {x, y} = e.currentTarget.getRelativePointerPosition();
    pixelMap.updateFocusPosition(Math.floor(x > 0 ? x + 1 : x), -Math.floor(y > 0 ? y + 1 : y));
  }, [pixelMap]);

  const mouseOverRect = useCallback(function (e: Konva.KonvaEventObject<MouseEvent>) {
    e.evt.preventDefault();
    // console.log(e.currentTarget.getClientRect());
  }, []);

  return (
    <Observer render={() => (
      <Stage
        ref={stageRef}
        draggable
        dragBoundFunc={dragBoundHandler}
        onTap={focusHandler}
        onMouseMove={focusHandler}
        onWheel={scaleHandler}
        onTouchMove={gestureHandler}
        onTouchEnd={gestureEndHandler}
      >
        <Observer render={() => (
          <Layer
            imageSmoothingEnabled={false}>
            {keys(pixelMap.data).map((key) => {
              return <Observer key={key.toString()} render={() => {
                const canvas: HTMLCanvasElement = document.createElement("canvas");
                canvas.width = pixelMap.width;
                canvas.height = pixelMap.height;
                const canvasContext = canvas.getContext("2d", {willReadFrequently: true})!;
                canvasContext.putImageData(
                  new ImageData(
                    new Uint8ClampedArray(pixelMap.data[key as number]), pixelMap.width, pixelMap.height,
                  ), 0, 0,
                );
                return (
                  <Image
                    x={0} y={0}
                    offsetX={pixelMap.width / 2}
                    offsetY={pixelMap.height / 2}
                    image={canvas} />
                );
              }} />;
            })}
            <Rect x={-1} y={-1} width={2} height={2} fill="red" />
            <Observer render={() => !(pixelMap.isDrawable && pixelMap.focusPosition) ? null : (
              <Rect
                onMouseMove={mouseOverRect}
                x={(pixelMap.focusPosition.x > 0 ? pixelMap.focusPosition.x - 1 : pixelMap.focusPosition.x)}
                y={-pixelMap.focusPosition.y > 0 ? -pixelMap.focusPosition.y - 1 : -pixelMap.focusPosition.y}
                height={1} width={1} fill={"#eccfa4"} />
            )} />
          </Layer>
        )} />
      </Stage>
    )} />
  );
};
