"use client";

import dynamic from "next/dynamic";

// Three.js needs the browser, so the 3D view is never rendered on the server.
const Cube = dynamic(() => import("./CubeView"), {
  ssr: false,
  loading: () => <div className="cube-view cube-loading" />,
});

export default Cube;
