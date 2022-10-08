import { Observer } from "mobx-react";
import { FunctionComponent } from "react";
import { useStore } from "../hooks";

export const PointPosition: FunctionComponent = () => {
  const {pixelMap} = useStore();
  return (
    <Observer render={() => (pixelMap.focusPosition && (
      <div style={{
        position: "absolute", bottom: 25, left: 25, padding: 8,
        borderColor: "white", borderWidth: 0.5, borderStyle: "solid", borderRadius: 64,
        textAlign: "center", color: "white", fontSize: "large",
        backgroundColor: "black",
      }}>
        <Observer render={() => (
          <div style={{
            display: "flex",minWidth: 100,
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
  );
};
