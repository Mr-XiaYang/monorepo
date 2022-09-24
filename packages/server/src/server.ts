import FastifyWebsocketPlugin from "@fastify/websocket";
import Fastify, { FastifyInstance } from "fastify";
import { ServerStatus } from "./server_status";
import { ServiceDefinition, ServiceImplement } from "./ServiceDefinition";

export class Server<T extends Record<string, ServiceDefinition<any, any>>> {
  protected instance: FastifyInstance;
  protected service: T;
  protected implement: ServiceImplement<T>;
  protected status: ServerStatus;
  readonly flows = {};

  constructor(proto) {
    this.status = ServerStatus.CLOSED;
    this.instance = Fastify({});
    this.instance.register(FastifyWebsocketPlugin);
  }

  addService(serviceDefinition: T, serviceImplement: ServiceImplement<T>): Server<T> {
    this.service = serviceDefinition;
    this.implement = serviceImplement;
    return this;
  }

  addServiceImplement() {

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
