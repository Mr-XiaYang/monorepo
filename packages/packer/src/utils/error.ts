import { CommanderError } from "commander";

export class InvalidArgumentError extends CommanderError {
  constructor(message: string) {
    super(1, "commander.InvalidArgumentError", message);
  }
}

export class InvalidOptionArgumentError extends CommanderError {
  constructor(message: string) {
    super(1, "commander.InvalidOptionArgumentError", message);
  }
}
