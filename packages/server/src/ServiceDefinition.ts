interface ReqType {

}

interface ResType {

}

interface MsgSerialize {
}

interface MsgDeserialize {
}

export interface QueryServiceDefinition<Req extends ReqType, Res extends ResType> {
  type: "QUERY";
  name: string,
  path: string,
  requestType: Req;
  responseType: Res;
  requestSerialize?: MsgSerialize
  requestDeserialize?: MsgDeserialize
  responseSerialize?: MsgSerialize
  responseDeserialize?: MsgDeserialize
}

export interface MutationServiceDefinition<Req extends ReqType, Res extends ResType> {
  type: "MUTATION";
  name: string,
  path: string,
  requestType: Req;
  responseType: Res;
  requestSerialize?: MsgSerialize
  requestDeserialize?: MsgDeserialize
  responseSerialize?: MsgSerialize
  responseDeserialize?: MsgDeserialize
}

export interface SubscriptionServiceDefinition<Req extends ReqType, Res extends ResType> {
  type: "SUBSCRIPTION";
  name: string,
  path: string,
  requestType: Req;
  responseType: Res;
  requestSerialize?: MsgSerialize
  requestDeserialize?: MsgDeserialize
  responseSerialize?: MsgSerialize
  responseDeserialize?: MsgDeserialize
}


export type ServiceDefinition<Req extends ReqType, Res extends ResType> =
  | QueryServiceDefinition<Req, Res>
  | MutationServiceDefinition<Req, Res>
  | SubscriptionServiceDefinition<Req, Res>

export type ServiceImplement<T extends Record<string, ServiceDefinition<any, any>>> = {
  [K in keyof T]: T[K] extends QueryServiceDefinition<any, any> ? () => void : never
}
