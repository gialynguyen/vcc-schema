import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";

const isWin = process.platform === "win32";

const name = require("./package.json").main.replace(/\.js$/, "");

const bundle = (config) => ({
  ...config,
  input: "src/index.ts",
  external: (id) => (isWin ? false : !/^[./]/.test(id)),
});

export default [
  bundle({
    plugins: [esbuild()],
    output: [
      {
        file: `${name}.js`,
        format: "cjs",
        sourcemap: true,
        exports: "named",
      },
      {
        file: `${name}.module.js`,
        format: "es",
        sourcemap: true,
        exports: "named",
      },
    ],
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: `${name}.d.ts`,
      format: "es",
      exports: "named",
    },
  }),
];
