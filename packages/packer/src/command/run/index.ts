import { Command } from "commander";
import { transform } from "esbuild";
import loglevel from "loglevel";
import InternalModule from "module";
import { install as installSourceMapSupport } from "source-map-support";
import { loaders, support } from "./loaders";
import { transpile } from "./transpile";

type PatchedModule = InternalModule & {
  _extensions: Record<string, (mod: PatchedModule, filename: string) => void>
  _compile: (code: string, filename: string) => unknown
}

const Module = InternalModule as unknown as PatchedModule;

export function install(options: { name: string } = {name: "run"}): Command {
  const logger = loglevel.getLogger(options.name);
  const command = new Command(options.name);
  command.summary("starts a app");
  command.description(`The ${options.name} command enabling you to directly execute app on Node.js without precompiling.`);
  command.argument("<entries...>", "“entries” are the files that starts at when building your source code.");
  command.helpOption("--help", `display help for ${options.name}`);
  command.action(async function (options) {
    logger.info(options);
    installSourceMapSupport({
      environment: "node", hookRequire: true,
    });
    const defaultJSLoader = Module._extensions[".js"];
    for (const ext in loaders) {
      const defaultLoader = Module._extensions[ext] || defaultJSLoader;
      Module._extensions[ext] = (mod, filename) => {
        if (support(filename)) {
          const defaultCompile = Module._compile;
          mod._compile = (code: string) => {
            mod._compile = defaultCompile;
            return mod._compile(transpile(code, filename, options), filename);
          };
        } else {
          defaultLoader(mod, filename);
        }
      };
    }
  });
  return command;
}
