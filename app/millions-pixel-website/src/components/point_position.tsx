import { Observer } from "mobx-react";
import { FunctionComponent, useMemo } from "react";
import { useStore } from "../hooks";

export type PointPositionProps = {
  offset: {
    top?: number,
    bottom?: number,
    left?: number,
    right?: number
  }
}

export const PointPosition: FunctionComponent<PointPositionProps> = (props) => {
  const {pixelMap} = useStore();
  const {offset: {top, right, bottom, left}} = props;
  return useMemo(() => (
    <Observer render={() => (pixelMap.focusPosition && (
      <div style={{position: "absolute", pointerEvents: "none", top, right, bottom, left}}>
        <Observer render={() => (
          <div style={{
            display: "flex", minWidth: 100, padding: 8,
            borderColor: "white", borderWidth: 0.5, borderStyle: "solid", borderRadius: 64,
            textAlign: "center", color: "white", fontSize: "large",
            backgroundColor: "black",
          }}>
          <span style={{flex: 1}}>
            {pixelMap.focusPosition!.x}
          </span>
            <span> {" , "}</span>
            <span style={{flex: 1}}>
            {pixelMap.focusPosition!.y}
          </span>
          </div>
        )} />
      </div>
    ))} />
  ), [top, right, bottom, left, pixelMap]);
};
