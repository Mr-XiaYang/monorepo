import Konva from "konva";
import { Observer } from "mobx-react";
import { FunctionComponent, useEffect, useRef } from "react";
import { Image, Layer } from "react-konva";
import { useStore } from "../../hooks";
import { colors } from "../../utils/colors";

export const DrawingBoard: FunctionComponent<{ worldId: string }> = ({worldId}) => {
  const {pixelMap} = useStore();
  const layerRef = useRef<Konva.Layer | null>(null);
  const imageRef = useRef<Konva.Image | null>(null);

  useEffect(() => {
    pixelMap.loadPixelMap(worldId);
  }, [pixelMap, worldId]);

  useEffect(() => {
    let handleId: number;
    let lastImage: ImageBitmap | null;

    function animationFrameHandle() {
      new Promise<ImageBitmap | null>((resolve) => {
        if (pixelMap.bitmap[worldId]) {
          if (!lastImage || !!pixelMap.pixels[worldId]?.length) {
            new Array(100).fill(null)
            .map(() => pixelMap.pixels[worldId]?.shift())
            .forEach((pixel) => {
              if (pixel) {
                const color: string = colors[pixel.color];
                const offset: number = -((pixel.y < 0 ? pixel.y + 1 : pixel.y) - 540) * 1920 + (960 + (pixel.x > 0 ? pixel.x - 1 : pixel.x));
                const value: number = parseInt(`ff${color.slice(5, 7)}${color.slice(3, 5)}${color.slice(1, 3)}`, 16);
                pixelMap.bitmap[worldId].set([value], offset);
              }
            });
            const imageData = new ImageData(
              new Uint8ClampedArray(pixelMap.bitmap[worldId].buffer), pixelMap.width, pixelMap.height,
            );
            resolve(createImageBitmap(imageData));
          } else {
            resolve(lastImage);
          }
        } else {
          resolve(null);
        }
      }).then((bitmap) => {
        lastImage = bitmap;
        if (bitmap) {
          imageRef.current?.image(bitmap);
        }
        handleId = window.requestAnimationFrame(animationFrameHandle);
      });
    }

    handleId = window.requestAnimationFrame(animationFrameHandle);
    return () => {
      window.cancelAnimationFrame(handleId);
    };
  }, [pixelMap]);

  return (
    <Observer render={() => (
      <Layer ref={layerRef} imageSmoothingEnabled={false}>
        <Image ref={imageRef}
               x={0} y={0}
               offsetX={pixelMap.width / 2}
               offsetY={pixelMap.height / 2}
               image={undefined}
        />
      </Layer>
    )} />
  );
};
