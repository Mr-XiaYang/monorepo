import FastifyWebsocketPlugin from "@fastify/websocket";
import Fastify, { FastifyInstance, FastifyBaseLogger } from "fastify";

import { ServerStatus } from "./server_status";
import { ServiceDefinition } from "./ServiceDefinition";
import { Level as LogLevel, pino } from "pino";

interface ServerOptions {
  json?: boolean,
  strictNullChecks?: boolean
  logger?: FastifyBaseLogger
  loggerLevel?: LogLevel
}

export class Server<T extends Record<string, ServiceDefinition<any, any>>> {
  protected options: Required<ServerOptions>;
  protected instance: FastifyInstance;
  protected logger: FastifyBaseLogger;
  protected status: ServerStatus;

  constructor(options?: ServerOptions) {
    this.options = {
      json: options?.json ?? false,
      strictNullChecks: options?.strictNullChecks ?? false,
      logger: options?.logger ?? pino(),
      loggerLevel: options?.loggerLevel ?? "info",
    };
    this.logger = this.options.logger;
    this.logger.level = this.options.loggerLevel;
    this.instance = Fastify({});
    this.instance.register(FastifyWebsocketPlugin, {});


    this.status = ServerStatus.CLOSED;
    processedUncaughtException(this.logger);
  }

  async start(host: string, port: number): Promise<Server<T>> {
    if (this.status != ServerStatus.CLOSED) {
      throw new Error("Server already started.");
    }
    this.logger.info("Starting server...");
    this.status = ServerStatus.OPENING;

    await this.instance.listen({host, port});
    this.status = ServerStatus.OPENED;
    return this;
  }

  stop() {

  }
}

let uncaughtExceptionIsProcessed: boolean = false;

function processedUncaughtException(logger: FastifyBaseLogger) {
  if (uncaughtExceptionIsProcessed) {
    return;
  }
  uncaughtExceptionIsProcessed = true;
  process.on("uncaughtException", (error) => {
    logger.error("[uncaughtException]", error);
  });
  process.on("unhandledRejection", (error) => {
    logger.error("[unhandledRejection]", error);
  });
}
