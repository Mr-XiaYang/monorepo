import Konva from "konva";
import { Observer } from "mobx-react";
import { FunctionComponent, useCallback, useEffect, useMemo, useRef } from "react";
import { Image, Layer } from "react-konva";
import { colors } from "../../config";
import { useStore } from "../../hooks";

export type DrawingBoardLayerProps = {
  worldId: string
}

const DrawingBoardLayer: FunctionComponent<DrawingBoardLayerProps> = (props) => {
  const {worldId} = props;
  const {pixelMap} = useStore();
  const imageRef = useRef<Konva.Image>(null);

  useEffect(() => {
    pixelMap.loadPixelMap(worldId).catch((error) => {
      console.log(error);
    });
  }, [pixelMap, worldId]);

  const callback = useCallback(async function* () {
    if (pixelMap.bitmap[worldId]) {
      if (pixelMap.pixels[worldId].length > 0) {
        const startTime = Date.now();
        while (Date.now() - startTime < 15) {
          const pixel = pixelMap.pixels[worldId].shift();
          if (pixel != null) {
            const color: string = colors[pixel.color];
            const offset: number = -((pixel.y < 0 ? pixel.y + 1 : pixel.y) - 540) * 1920 + (960 + (pixel.x > 0 ? pixel.x - 1 : pixel.x));
            const value: number = parseInt(`ff${color.slice(5, 7)}${color.slice(3, 5)}${color.slice(1, 3)}`, 16);
            pixelMap.bitmap[worldId].set([value], offset);
          } else {
            break;
          }
        }
      }

      await createImageBitmap(new ImageData(
        new Uint8ClampedArray(pixelMap.bitmap[worldId].buffer), pixelMap.width, pixelMap.height,
      ));
    }
    yield null;
  }, [pixelMap]);


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
