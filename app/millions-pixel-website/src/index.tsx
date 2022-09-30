import React, { useMemo } from "react";
import { PointPosition } from "./components/point_position";
import { MainStage } from "./components/stage";
import { RootStoreContext } from "./context";
import { RootStore } from "./store";

import "./global.css";

const App = () => {
  const store = useMemo(() => new RootStore(), []);
  return (
    <RootStoreContext.Provider value={store}>
        <MainStage />
        <PointPosition />
    </RootStoreContext.Provider>
  );
};

export default App;
