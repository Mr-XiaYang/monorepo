import sucrase from "@rollup/plugin-sucrase"
import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from "@rollup/plugin-replace";
import alias from "@rollup/plugin-alias";
import {terser} from "rollup-plugin-terser";

import {defineConfig} from 'rollup';

import packageConfig from "./package.json";

const dependencies = []
  .concat(Object.keys(packageConfig.dependencies ?? {}))
  .concat(Object.keys(packageConfig.peerDependencies ?? {}))
  .filter(dependency => ![].includes(dependency))

const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';
const isWatch = process.env.ROLLUP_WATCH === 'true';

export default defineConfig({
  input: ["./src/index.ts", "./src/filter.ts", "./src/remove.ts", "./src/sort.ts", "./src/math.ts",],

  output: [{
    dir: "./lib", format: 'commonjs', exports: 'named', sourcemap: isDev,
    entryFileNames: (info) => info.name + '.cjs',
  }, {
    dir: "./lib", format: 'module', exports: 'named', sourcemap: isDev,
    entryFileNames: (info) => info.name + '.mjs',
  }],

  watch: {
    include: './src/**'
  },

  onwarn: (warning) => {
    if (warning.code !== 'CIRCULAR_DEPENDENCY') {
      console.warn(`(!) ${warning.message}`) // eslint-disable-line no-console
    } else {
      console.info(`(!) ${warning.message}`) // eslint-disable-line no-console
    }
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

    sucrase({
      exclude: ['node_modules/**'], transforms: ["typescript"],
    }),

    isProd && terser(),].filter(Boolean)
})
