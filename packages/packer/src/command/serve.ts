import { Command } from "commander";
import loglevel from "loglevel";
import { InvalidOptionArgumentError } from "../utils/error";

export const IPRegex: RegExp =
  /^(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d{2}|2[0-4]\d|25[0-5])$/;
export const HostRegex: RegExp =
  /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
export const PortRegex: RegExp =
  /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;

export function install(options: { name: string } = {name: "serve"}): Command {
  const logger = loglevel.getLogger(options.name);
  const command = new Command(options.name);
  command.summary("starts a development server");
  command.description(`The ${options.name} command starts a development server, which will automatically rebuild your app as you change files, and supports hot reloading. It accepts one or more file paths or globs as entries.`);
  command.argument("<entries...>", "“entries” are the files that Parcel starts at when building your source code.");
  command.option(
    "-h --host <string>",
    "set the host to listen on, defaults to listening on all interfaces",
    (value) => {
      if (!HostRegex.test(value) || !IPRegex.test(value)) {
        throw new InvalidOptionArgumentError(`The '${value}' host could not be used.`);
      }
      return value;
    }, `0.0.0.0`);
  command.option(
    "-p --port <number>",
    "set the port to serve on. defaults to $PORT or 8080", (value) => {
      if (!PortRegex.test(value)) {
        throw new InvalidOptionArgumentError(`The "${value}" port could not be used.`);
      }
      return Number(value);
    }, 8080);
  command.option("--open", "automatically open in specified browser, defaults to $BROWSER or default browser", true);
  command.option("--lazy", "Build async bundles on demand, when requested in the browser", true);
  command.option("--no-hmr", "disable hot module replacement", false);
  command.helpOption("--help", `display help for ${options.name}`);
  command.action(async function (options) {
    logger.info(options);
    console.log("as");
  });
  return command;
}
