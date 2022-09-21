import Fastify, { FastifyInstance, RouteShorthandOptions } from "fastify";

interface Service {
  models: string[];
  views: string[];
}

export interface ServerOptions {
  service?: Service[];
}


export class Server {
  instance: FastifyInstance;

  constructor(options: ServerOptions) {
    this.instance = Fastify({});
  }

  register(path: string, service: Service): Server {
    return this;
  }

  start(host: string, port: number, callback?: (error?: Error) => void) {
    try {

      callback();
    } catch (error) {
      callback(error);
    }
  }

  stop() {

  }
}
