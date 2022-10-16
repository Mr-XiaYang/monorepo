import { Fragment, FunctionComponent, useMemo } from "react";
import { DrawingBoard, DrawingBoardLayer } from "../components/drawing_board";
import { PointPosition } from "../components/point_position";

export const MainPage: FunctionComponent = () => {
  return useMemo(() => (
    <Fragment>
      <DrawingBoard>
        <DrawingBoardLayer worldId={"1"}/>
      </DrawingBoard>
      <PointPosition offset={{bottom: 25, left: 25}} />
    </Fragment>
  ), []);
};
