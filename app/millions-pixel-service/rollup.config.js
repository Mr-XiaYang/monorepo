import sucrase from "@rollup/plugin-sucrase"
import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from "@rollup/plugin-replace";
import run from '@rollup/plugin-run';
import alias from "@rollup/plugin-alias";
import {terser} from "rollup-plugin-terser";

import packageConfig from "./package.json";
import path from "path";

const dependencies = []
  .concat(Object.keys(packageConfig.dependencies ?? {}))
  .concat(Object.keys(packageConfig.peerDependencies ?? {}))
  .filter(dependencies => ![].includes(dependencies))

const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';
const isWatch = process.env.ROLLUP_WATCH === 'true';

export default commandLineArgs => {
  delete commandLineArgs.input;
  return {
    input: "./src/index.ts",

    output: {
      file: './dist/index.js', format: 'cjs', exports: 'named', sourcemap: true
    },

    watch: {
      include: 'src/**'
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

      alias({
      }),

      json(),

      resolve({
        rootDir: __dirname, extensions: ['.json', '.js', '.jsx', '.es6', '.es', '.mjs', '.ts', '.tsx']
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

      isProd && terser(),

      isWatch && run({
        args: commandLineArgs['_'],
        allowRestarts: true,
        execArgv: ["--preserve-symlinks", '-r', 'source-map-support/register']
      })

    ].filter(Boolean)
  }
}
