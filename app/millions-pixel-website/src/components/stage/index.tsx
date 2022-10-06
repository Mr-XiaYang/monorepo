import Konva from "konva";
import { autorun, keys } from "mobx";
import { Observer } from "mobx-react";
import React, { useCallback, useEffect, useRef } from "react";

import { Image, Layer, Rect, Stage } from "react-konva";
import { useStore } from "../../hooks";

export const MainStage = () => {
  const {pixelMap} = useStore();
  const stageRef = useRef<Konva.Stage | null>(null);

  useEffect(() => {
    stageRef.current?.move({
      x: window.innerWidth / 2, y: window.innerHeight / 2,
    });
    pixelMap.loadPixelMap(1);
    pixelMap.updateViewPort(
      window.innerWidth || document.documentElement.clientWidth
      || document.getElementsByTagName('body')[0].clientWidth,
      window.innerHeight || document.documentElement.clientHeight
      || document.getElementsByTagName('body')[0].clientHeight,
    )

    const disposers = [
      autorun(() => {
        stageRef.current?.width(pixelMap.viewport.width)
        stageRef.current?.height(pixelMap.viewport.height)
      }),
      autorun(() => {
        stageRef.current?.scaleX(pixelMap.scale);
        stageRef.current?.scaleY(pixelMap.scale);
      })
    ];
    return () => {
      disposers.forEach(disposer => disposer());
    }
  }, []);

  useEffect(() => {
    const resize = () => pixelMap.updateViewPort(
      window.innerWidth || document.documentElement.clientWidth
      || document.getElementsByTagName('body')[0].clientWidth,
      window.innerHeight || document.documentElement.clientHeight
      || document.getElementsByTagName('body')[0].clientHeight,
    )
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize)
  }, [pixelMap])

  const wheelStage = useCallback(function (e: Konva.KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault();
    pixelMap.updateScale(e.evt.deltaX < 0 || e.evt.deltaY < 0 || e.evt.deltaZ < 0);
  }, [pixelMap]);

  const mouseMoveLayer = useCallback(function (e: Konva.KonvaEventObject<MouseEvent>) {
    e.evt.preventDefault();
    const {x, y} = e.currentTarget.getRelativePointerPosition();
    pixelMap.updatePointerPosition(Math.floor(x > 0 ? x + 1 : x), -Math.floor(y > 0 ? y + 1 : y));
  }, [pixelMap]);

  const mouseOverRect = useCallback(function (e: Konva.KonvaEventObject<MouseEvent>) {
    console.log(e.currentTarget.getClientRect())
  }, [])

  return (
    <Observer render={() => (
      <Stage
        ref={stageRef}
        draggable


      >
        <Observer render={() => (
          <Layer onWheel={wheelStage}
            onMouseMove={mouseMoveLayer} imageSmoothingEnabled={false}>
            {keys(pixelMap.data).map((key) => {
              return <Observer key={key.toString()} render={() => {
                const canvas: HTMLCanvasElement = document.createElement("canvas");
                canvas.width = pixelMap.width;
                canvas.height = pixelMap.height;
                const canvasContext = canvas.getContext("2d", { willReadFrequently: true })!;
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
            <Observer render={() => !(pixelMap.isDrawable && pixelMap.pointerPosition) ? null : (
              <Rect
                onMouseMove={mouseOverRect}
                x={(pixelMap.pointerPosition.x > 0 ? pixelMap.pointerPosition.x - 1 : pixelMap.pointerPosition.x)}
                y={-pixelMap.pointerPosition.y > 0 ? -pixelMap.pointerPosition.y - 1 : -pixelMap.pointerPosition.y}
                height={1} width={1} fill={"#eccfa4"} />
            )} />

          </Layer>
        )} />
      </Stage>
    )} />
  );
};
