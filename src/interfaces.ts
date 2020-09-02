import { RoutingControllersOptions } from "routing-controllers";
import { Request as ExpressRequest } from 'express'
export { Response } from 'express'
import * as SocketIO from 'socket.io'

export enum PeriodogramPeriodType {
  FOURIER = 'per',
  WELCH = 'welch',
  LOMB_SCARGLE = 'lomb_scargle',
}

export enum CosinorType {
  COSINOR = 'general cosinor',
  COSINOR1 = 'cosinor1',
}

export enum FitType {
  POPULATION = 'POPULATION',
  INDEPENDENT = 'INDEPENDENT',
}

export enum CosinorAnalysisCommand {
  PERIODOGRAM = 'periodogram',
  FIT_GROUP = 'fit_group',
}

export enum GeneralCommand {
  GENERATE_DATA = 'generate_data'
}

export interface Graph {
  command: CosinorAnalysisCommand,
  data: string,
}

export enum FileType {
  CSV = 'text/csv',
  XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
}

export type GraphsResponse = Graph[]

export interface Config extends RoutingControllersOptions {
  serviceName: string,
  port: number
}

export interface Request extends ExpressRequest {
  webSocket?: SocketIO.Socket
}