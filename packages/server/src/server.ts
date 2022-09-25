import FastifyWebsocketPlugin from "@fastify/websocket";
import Fastify, { FastifyInstance } from "fastify";
import * as process from "process";
import { Flow } from "./flow";
import { defaultLogger, Logger, LoggerLevel } from "./logger";
import { ServerStatus } from "./server_status";
import { ServiceDefinition, ServiceImplement } from "./ServiceDefinition";

interface ServerOptions  {
  json?: boolean,
  strictNullChecks?: boolean
  logger?: Logger
  loggerLever?: LoggerLevel
}

export class Server<T extends Record<string, ServiceDefinition<any, any>>> {
  protected options: Required<ServerOptions>;
  protected logger: Logger;
  protected instance: FastifyInstance;


  protected serviceMap: T;
  protected implement: ServiceImplement<T>;
  protected status: ServerStatus;
  readonly flows = {
    connectFlow: new Flow(),
    receiveMsgFlow:new Flow(),
    preCallFlow: {
      query: new Flow(),
      mutation: new Flow(),
      subscription: new Flow()
    },
    sendDataFlow: {
      query: new Flow(),
      mutation: new Flow(),
      subscription: new Flow()
    },
    postCallFlow:{
      query: new Flow(),
      mutation: new Flow(),
      subscription: new Flow()
    },
    disconnectFlow: new Flow(),
  };

  constructor(proto, options?: ServerOptions) {
    this.options = {
      json: options?.json ?? false,
      strictNullChecks: options?.strictNullChecks ?? false,
      logger: options.logger ?? defaultLogger,
      loggerLever: options.loggerLever ?? LoggerLevel.TRACE
    }
    this.logger = this.options.logger
    this.logger.setLevel(this.options.loggerLever);

    this.instance = Fastify({});
    this.instance.register(FastifyWebsocketPlugin);
    this.status = ServerStatus.CLOSED;

    processedUncaughtException(this.logger);
  }

  addService(serviceDefinition: T, serviceImplement: ServiceImplement<T>): Server<T> {
    this.serviceMap = serviceDefinition;
    this.implement = serviceImplement;
    return this;
  }

  start(host: string, port: number, callback?: (error?: Error) => void) {
    this.status = ServerStatus.OPENING;
    try {
      callback();
    } catch (error) {
      callback(error);
    }
  }

  stop() {

  }
}


let uncaughtExceptionIsProcessed: boolean = false;
 function processedUncaughtException(logger:Logger) {
  if(uncaughtExceptionIsProcessed) {
    return;
  }
  this.uncaughtExceptionIsProcessed = true;
  process.on('uncaughtException', (error) => {
    logger.error('[uncaughtException]', error)
  });
  process.on("unhandledRejection", (error) => {
    logger.error("[unhandledRejection]", error)
  })
}
