import Konva from "konva";
import { FunctionComponent, useEffect, useMemo, useRef } from "react";
import { Image, Layer } from "react-konva";
import { useStore } from "../../hooks";
import { Observer } from "mobx-react";

export type DrawingBoardLayerProps = {
  worldId: string
}

const DrawingBoardLayer: FunctionComponent<DrawingBoardLayerProps> = (props) => {
  const {worldId} = props;
  const {pixelMap} = useStore();
  const imageRef = useRef<Konva.Image>(null);

  useEffect(() => {
    pixelMap.loadPixelMap(worldId).finally();
  }, [pixelMap, worldId]);

  return useMemo(() => (
    <Layer imageSmoothingEnabled={false}>
      <Observer render={() => (
        <Image
          ref={imageRef}
          x={0} y={0}
          offsetX={pixelMap.width / 2}
          offsetY={pixelMap.height / 2}
          image={undefined}
        />
      )} />
    </Layer>
  ), [pixelMap]);
};


export default DrawingBoardLayer;
