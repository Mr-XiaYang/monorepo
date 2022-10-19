import Konva from "konva";
import { Vector2d } from "konva/lib/types";
import { autorun } from "mobx";
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef } from "react";
import { Stage } from "react-konva";
import { RootStoreContext } from "../../context";
import { useStore } from "../../hooks";

export type DrawingBoardProps = {
  children: React.ReactNode
}

const DrawingBoard: FunctionComponent<DrawingBoardProps> = (props) => {
  const rootStore = useStore();
  const stageRef = useRef<Konva.Stage | null>(null);
  const {children} = props;

  useEffect(() => {
    const width = window.innerWidth || document.documentElement.clientWidth
      || document.getElementsByTagName("body")[0].clientWidth;
    const height = window.innerHeight || document.documentElement.clientHeight
      || document.getElementsByTagName("body")[0].clientHeight;
    rootStore.pixelMap.updateViewPort({width, height});
    stageRef.current?.move({x: Math.round(width / 2), y: Math.round(height / 2)});
  }, [rootStore.pixelMap]);

  useEffect(() => {
    const resizeEventListener = () => rootStore.pixelMap.updateViewPort(
      {
        width: window.innerWidth || document.documentElement.clientWidth
          || document.getElementsByTagName("body")[0].clientWidth,
        height: window.innerHeight || document.documentElement.clientHeight
          || document.getElementsByTagName("body")[0].clientHeight,
      },
    );
    const disposers = [
      autorun(() => {
        stageRef.current?.scaleX(rootStore.pixelMap.scale);
        stageRef.current?.scaleY(rootStore.pixelMap.scale);
      }),
      autorun(() => {
        stageRef.current?.width(rootStore.pixelMap.viewport.width);
        stageRef.current?.height(rootStore.pixelMap.viewport.height);
      }),
    ];
    window.addEventListener("resize", resizeEventListener);
    return () => {
      disposers.forEach(disposer => disposer());
      window.removeEventListener("resize", resizeEventListener);
    };
  }, [rootStore.pixelMap]);

  const scaleHandler = useCallback(function (e: Konva.KonvaEventObject<WheelEvent>) {
    e.evt.preventDefault();
    const direction = e.evt.deltaX < 0 || e.evt.deltaY < 0 || e.evt.deltaZ < 0;
    const oldScale = rootStore.pixelMap.scale;
    const newScale = direction
      ? Math.min(rootStore.pixelMap.scale + 0.2, rootStore.pixelMap.maxScale)
      : Math.max(rootStore.pixelMap.scale - 0.2, rootStore.pixelMap.minScale);
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
      rootStore.pixelMap.updateScale(newScale);
      newPoint && stageRef.current?.position(newPoint);
      stageRef.current?.absolutePosition(
        dragBoundHandler(stageRef.current?.absolutePosition()),
      );
    }
  }, [rootStore.pixelMap]);

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
        x: (center.x - stageRef.current!.x()) / rootStore.pixelMap.scale,
        y: (center.y - stageRef.current!.y()) / rootStore.pixelMap.scale,
      };
      const newPoint = {
        x: center.x - pointTo.x * rootStore.pixelMap.scale + center.x - lastCenter.current.x,
        y: center.y - pointTo.y * rootStore.pixelMap.scale + center.y - lastCenter.current.y,
      };
      const newScale = rootStore.pixelMap.scale * (dist / lastDist.current);

      lastDist.current = dist;
      lastCenter.current = center;
      rootStore.pixelMap.updateScale(newScale);
      stageRef.current.position(newPoint);
      stageRef.current.absolutePosition(
        dragBoundHandler(stageRef.current.absolutePosition()),
      );
    }
  }, [rootStore.pixelMap]);
  const gestureEndHandler = useCallback(function (e: Konva.KonvaEventObject<TouchEvent>) {
    lastDist.current = undefined;
    lastCenter.current = undefined;
  }, []);
  const dragBoundHandler = useCallback(function (pos: Vector2d): Vector2d {
    const dragDistanceX = rootStore.pixelMap.width / 2 + 5;
    const dragDistanceY = rootStore.pixelMap.height / 2 + 5;
    const maxX = dragDistanceX * rootStore.pixelMap.scale;
    const minX = -(dragDistanceX * rootStore.pixelMap.scale) + rootStore.pixelMap.viewport.width;
    const maxY = dragDistanceY * rootStore.pixelMap.scale;
    const minY = -(dragDistanceY * rootStore.pixelMap.scale) + rootStore.pixelMap.viewport.height;
    return {
      x: Math.round(pos.x >= maxX ? maxX : pos.x <= minX ? minX : pos.x),
      y: Math.round(pos.y >= maxY ? maxY : pos.y <= minY ? minY : pos.y),
    };
  }, [rootStore.pixelMap]);

  const focusHandler = useCallback(function (e: Konva.KonvaEventObject<Event>) {
    e.evt.preventDefault();
    const {x, y} = e.currentTarget.getRelativePointerPosition();
    rootStore.pixelMap.updateFocusPosition(Math.floor(x > 0 ? x + 1 : x), -Math.floor(y > 0 ? y + 1 : y));
  }, [rootStore.pixelMap]);

  const blurHandler = useCallback(function (e: Konva.KonvaEventObject<MouseEvent>) {
    e.evt.preventDefault();
    rootStore.pixelMap.updateFocusPosition();
  }, [rootStore.pixelMap]);

  return useMemo(() => (
    <Stage
      ref={stageRef}
      draggable dragBoundFunc={dragBoundHandler}
      onTap={focusHandler} onMouseMove={focusHandler} onMouseLeave={blurHandler}
      onWheel={scaleHandler} onTouchMove={gestureHandler} onTouchEnd={gestureEndHandler}>
      <RootStoreContext.Provider value={rootStore}>
        {children}
      </RootStoreContext.Provider>
    </Stage>
  ), [rootStore, children]);
};

export default DrawingBoard;
