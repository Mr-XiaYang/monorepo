import React, { useMemo } from "react";
import ColorPalette from "./components/color_palette";
import { PointPosition } from "./components/point_position";
import { MainStage } from "./components/stage";
import { RootStoreContext } from "./context";
import { MainPage } from "./pages/main_page";
import { RootStore } from "./store";

import "./utils/fixRequestAnimationFrame";

import "./global.css";

const App = () => {
  const store = useMemo(() => new RootStore(), []);
  return (
    <RootStoreContext.Provider value={store}>
      <MainPage />
    </RootStoreContext.Provider>
  );
};

export default App;
