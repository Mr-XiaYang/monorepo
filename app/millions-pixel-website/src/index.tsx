import React, { FunctionComponent, PropsWithChildren, useMemo } from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import { MainStage } from "./containers/stage";
import { RootStoreContext } from "./context";
import { RootStore } from "./store";

const Fragment = import.meta.env.PROD ? React.Fragment : React.Fragment;

const App = () => {
  const store = useMemo(() => new RootStore(), []);
  return (
    <RootStoreContext.Provider value={store}>
      <MainStage />
    </RootStoreContext.Provider>
  );
};

export default App;

// ReactDOM.createRoot(document.getElementById("root")!).render(
//   <Fragment>
//     <App />
//   </Fragment>,
// );

