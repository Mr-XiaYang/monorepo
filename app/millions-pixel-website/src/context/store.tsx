import React, { FunctionComponent, PropsWithChildren, useMemo } from "react";
import { RootStore } from "../store";

export default React.createContext<RootStore | undefined>(undefined);


