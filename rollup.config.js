/* eslint-disable */
import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import inject from "rollup-plugin-inject";
import json from "rollup-plugin-json";
import nodeResolve from "rollup-plugin-node-resolve";
import replace from "rollup-plugin-replace";
import { uglify } from "rollup-plugin-uglify";
import filesize from "rollup-plugin-filesize";
import pkg from './package.json'
const processShim = "\0process-shim";

const prod = process.env.PRODUCTION;
const env = prod ? "production" : "development";
console.log(`Creating ${env} bundle...`);

const globals = {
  "react": "React",
  "styled-components": "styled",
}
const output = prod
  ? [{
    file: "dist/hedron.min.js",
    format: 'umd',
    exports: 'named',
    sourcemap: true,
    name: 'hedron'
  }]
  : [{
    file: "dist/hedron.js",
    format: 'umd',
    exports: 'named',
    sourcemap: true,
    name: 'hedron'
  },
    {
    file: "dist/hedron.es.js",
    format: 'es',
    exports: 'named',
    sourcemap: true,
    name: 'hedron'
  }];

const commonPlugins = [
  {
    resolveId(importee) {
      if (importee === processShim) return importee;
      return null;
    },
    load(id) {
      if (id === processShim) return "export default { argv: [], env: {} }";
      return null;
    },
  },
  babel({
    exclude: "node_modules/**",
    babelrc: false,
    presets: ["es2015-rollup", "react", "stage-2"],
    plugins: ["array-includes", "external-helpers"],
  }),
  filesize(),
  commonjs(),
  inject({
    process: processShim,
  }),
  json(),
  nodeResolve(),
  replace({
    "process.env.NODE_ENV": JSON.stringify(prod ? "production" : "development"),
  }),
];

const configBase = {
  input: './src/index.js',
  external: ["react", "styled-components"],
  plugins: commonPlugins
};

const nativeConfig = {
  ...configBase,
  input: './src/native/index.js',
  output: [
    {
      file: 'native/dist/hedron.native.cjs.js',
      format: 'cjs',
      exports: 'named',
      sourcemap: true
    },
    {
      file: 'native/dist/hedron.native.es.js',
      format: 'es',
      exports: 'named',
      sourcemap: true
    }
  ]
}

const mainConfig = {
  ...configBase,
  output,
  plugins: commonPlugins,
  globals
};

export default [
  mainConfig,
  nativeConfig
];
