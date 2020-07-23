import typescript from "rollup-plugin-typescript2";
import buble from "@rollup/plugin-buble";
import { terser } from "rollup-plugin-terser";

import pkg from "./package.json";

export default [
  {
    input: "src/scrollimation.ts",
    output: {
      name: "Scrollimation",
      file: pkg.main,
      format: "umd",
      sourcemap: true,
    },
    plugins: [typescript(), buble(), terser()],
  },
  {
    input: "src/scrollimation.ts",
    output: {
      name: "Scrollimation",
      file: pkg.module,
      format: "es",
      sourcemap: true,
    },
    plugins: [typescript(), terser()],
  },
  {
    input: "src/scrollimation.ts",
    output: {
      name: "Scrollimation",
      file: pkg.unpkg,
      format: "iife",
      sourcemap: true,
    },
    plugins: [typescript(), buble(), terser()],
  },
];
