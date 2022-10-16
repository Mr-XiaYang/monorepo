import { FunctionComponent, useMemo } from "react";

import { colors } from "../config";

const ColorPalette: FunctionComponent = () => {
  console.log(colors.slice(0, 16));
  return useMemo(() => (
    <div style={{position: "absolute"}}>
      test
    </div>), [],
  );
};

export default ColorPalette;
