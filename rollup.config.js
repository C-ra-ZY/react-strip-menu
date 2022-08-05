import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";
import external from "rollup-plugin-peer-deps-external";
import postcss from "rollup-plugin-postcss";

const packageJson = require("./package.json");

export default {
  input: "src/index.tsx",
  external: ["react", "react-dom", "rebass"],
  output: [
    {
      file: packageJson.main,
      format: "cjs",
      sourcemap: true,
      name: "react-ts-lib",
      /*  globals: {
        react: "React",
        "react-dom": "ReactDOM",
      }, */
    },
    {
      file: packageJson.module,
      format: "esm",
      sourcemap: true,
      /*     globals: {
        react: "React",
        "react-dom": "ReactDOM",
      }, */
    },
  ],
  plugins: [
    external(),
    resolve(),
    commonjs(),
    typescript({ tsconfig: "./tsconfig.json" }),
    postcss(),
    terser(),
  ],
};
/* {
    input: "dist/esm/index.d.ts",
    // input: "dist/esm/types/index.d.ts",
    output: [{ file: "dist/index.d.ts", format: "esm" }],
    external: [/\.css$/],
    plugins: [dts()],
  }, */
