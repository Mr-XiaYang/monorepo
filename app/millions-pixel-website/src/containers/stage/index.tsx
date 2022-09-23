import { useLocalObservable } from "mobx-react";
import React, { Fragment } from "react";
import { Observer } from "mobx-react";
import { Layer, Rect, Stage, Text } from "react-konva";


export function MainStage() {

  const state = useLocalObservable(() => ({
      pixel: [] as Array<{ x: number, y: number }>,
    }),
  );
  React.useEffect(() => {

  }, [state]);

  return (
    <Stage
      draggable
      width={window.innerWidth} height={window.innerHeight}
    >
      <Layer>
        <Text text={"text"} />
        <Observer render={() => (
          <React.Fragment>
            {state.pixel.map((pixel) => (
              <Rect
                key={`${pixel.x}:${pixel.y}`}
                x={pixel.x * 10}
                y={pixel.y * 10}
                height={10} width={10} fill={"red"} />
            ))}
          </React.Fragment>
        )} />
      </Layer>
    </Stage>
  );
}
