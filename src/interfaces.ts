import { RequestHandler } from "express";
import { Controller } from "./controllers/interfaces";
import { RoutingControllersOptions } from "routing-controllers";
import { Request as ExpressRequest } from 'express'
export { Response } from 'express'
import * as SocketIO from 'socket.io'

export interface Config extends RoutingControllersOptions {
  serviceName: string,
  port: number
}

export interface Request extends ExpressRequest {
  webSocket?: SocketIO.Socket
}