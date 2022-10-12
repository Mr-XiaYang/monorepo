import resolve from "@rollup/plugin-node-resolve";
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import replace from "@rollup/plugin-replace";
import alias from "@rollup/plugin-alias";
import {swc} from "rollup-plugin-swc3";
import run from '@rollup/plugin-run';
import path from "path";
import {fileURLToPath} from 'url';
import {defineConfig} from 'rollup';

import packageConfig from "./package.json" assert {type: "json"};

const isProd = process.env.NODE_ENV === 'production';
const isDev = process.env.NODE_ENV === 'development';
const isWatch = process.env.ROLLUP_WATCH === 'true';

export default defineConfig(
  {
    input: "./src/index.ts",

    output: [{
      dir: "./lib", format: 'commonjs', exports: 'named',
      entryFileNames: ({name}) => `${name}.mjs`,
    }, {
      dir: "./lib", format: 'module', exports: 'named',
      entryFileNames: ({name}) => `${name}.mjs`,
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

    external: id => {
      let dependencies = []
        .concat(Object.keys(packageConfig.dependencies ?? {}))
        .concat(Object.keys(packageConfig.peerDependencies ?? {}))

      if (isDev) {
        dependencies = dependencies.filter(
          dependency => !["@m_xy/array_extend"].includes(dependency)
        )
      }

      return !!dependencies.find(dep => dep === id || id.startsWith(`${dep}/`))
    },

    plugins: [

      isDev && alias({
        entries: [
          {
            find: /^@m_xy\/array_extend$/,
            replacement: path.join(
              path.dirname(fileURLToPath(import.meta.url)),
              "node_modules/@m_xy/array_extend/src/index.ts"
            )
          },
          {
            find: /^@m_xy\/array_extend\/(.*)$/,
            replacement: path.join(
              path.dirname(fileURLToPath(import.meta.url)),
              "node_modules/@m_xy/array_extend/src/$1.ts"
            )
          }
        ]
      }),

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
        sourceMaps: "inline",
        minify: isProd
      }),

      isWatch && run()

    ].filter(Boolean)
  })
