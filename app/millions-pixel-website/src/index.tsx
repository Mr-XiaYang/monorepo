import React from "react";
import ReactDOM from "react-dom/client";
import "./global.css";
import { MainStage } from "./containers/stage";

const Fragment = import.meta.env.PROD ? React.Fragment : React.StrictMode;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <Fragment>
    <MainStage />
  </Fragment>,
);

