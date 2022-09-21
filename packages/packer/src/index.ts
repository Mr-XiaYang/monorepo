import { Command } from "commander";
import { bin, version } from "../package.json";
import loglevel from "loglevel";
import loglevelPrefixPlugin from "loglevel-plugin-prefix";

loglevelPrefixPlugin.reg(loglevel);
loglevelPrefixPlugin.apply(loglevel, {
  format(level, name, timestamp) {
    return `${level} (command.${name}):`;
  },
});

import runCommand from "./command/run";
import { install as installServeCommand } from "./command/serve";

const command = new Command(Object.keys(bin).pop());
command.usage(`<command> [options]`);
command.addCommand(runCommand);
command.addCommand(installServeCommand({name: "serve"}));
command.version(version, "-v --version", `Prints the current version`);
command.helpOption("--help", `Prints help information`);
export default command;



