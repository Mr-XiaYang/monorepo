import { CommanderError } from "commander";
import logger from "loglevel";
import process from "process";
import command from "./index";

try {
  await command.parseAsync();
} catch (error) {
  if (error instanceof CommanderError) {
    logger.error(error.message);
    process.exit(error.exitCode);
  } else {
    logger.trace(error);
    process.exit(1);
  }
}




