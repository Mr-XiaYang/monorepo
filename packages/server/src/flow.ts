import { ServerError } from "./error";
import { Logger } from "./logger";

export type FlowNodeReturn<T> = T | null | undefined;
export type FlowNode<T> = (item: T) => FlowNodeReturn<T> | Promise<FlowNodeReturn<T>>;

export type FlowData<T extends Flow<any>> = T extends Flow<infer R> ? R : unknown;

export class Flow<T> {
  nodes: FlowNode<T>[] = [];

  async exec(input: T, logger: Logger | undefined): Promise<FlowNodeReturn<T>> {
    let res: ReturnType<FlowNode<T>> = input;

    for (let i = 0; i < this.nodes.length; ++i) {
      try {
        res = await this.nodes[i](res);
      } catch (e) {
        this.onError(e, res!, input, logger);
        return undefined;
      }

      // Return 非true 表示不继续后续流程 立即中止
      if (res === null || res === undefined) {
        return res;
      }
    }

    return res;
  }

  push<K extends T>(node: FlowNode<K>): FlowNode<K> {
    this.nodes.push(node as any);
    return node;
  }

  remove<K extends T>(node: FlowNode<K>) {
    return this.nodes.filter(v => v !== node);
  }

  onError: (e: Error | ServerError, last: T, input: T, logger: Logger | undefined) => void = (e, last, input, logger) => {
    logger?.error("Uncaught ServerError:", e);
  };
}
