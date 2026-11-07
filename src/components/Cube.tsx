"use client";

import dynamic from "next/dynamic";
import { CUBE_BOX } from "./cubeBox";

// Three.js needs the browser, so the 3D view is never rendered on the server.
const Cube = dynamic(() => import("./CubeView"), {
  ssr: false,
  loading: () => <div className={CUBE_BOX} />,
});

export default Cube;
