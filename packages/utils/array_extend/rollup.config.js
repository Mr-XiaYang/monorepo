import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from "@rollup/plugin-replace";
import alias from "@rollup/plugin-alias";
import glob from "glob"
import {swc} from "rollup-plugin-swc3";

import {defineConfig} from 'rollup';

import packageConfig from "./package.json" assert { type: "json" };

const dependencies = []
  .concat(Object.keys(packageConfig.dependencies ?? {}))
  .concat(Object.keys(packageConfig.peerDependencies ?? {}))
  .filter(dependency => ![].includes(dependency))

const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';
const isWatch = process.env.ROLLUP_WATCH === 'true';

const config = defineConfig({
  input : glob.sync("src/*.ts", {
    ignore:  ["**/*.test.ts", "**/*.spec.ts"]
  }),

  output : [{
    dir: "./lib", format: 'commonjs', exports: 'named', entryFileNames: (info) => info.name + '.cjs',
  }, {
    dir: "./lib", format: 'module', exports: 'named', entryFileNames: (info) => info.name + '.mjs',
  }],

  watch: {
    include: 'src/**'
  },

  external: id => !!dependencies.find(dep => dep === id || id.startsWith(`${dep}/`)),

  plugins: [

    alias({}),

    json(),

    resolve({
      extensions: ['.json', '.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx']
    }),

    commonjs(),

    replace({
      preventAssignment: true, values: {
        "process.env.NODE_ENV": `"${process.env.NODE_ENV}"`,
      }
    }),

    swc({
      tsconfig: "tsconfig.json",
      minify: isProd
    }),

  ].filter(Boolean)
})

export default config;
