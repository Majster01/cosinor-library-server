import * as SocketIO from 'socket.io'
import * as handlers from '../handlers'
import { getPythonOptions } from './helpers'

export interface DataFramePoint {
  x: number,
  y: number,
}

export enum PeriodogramPeriodType {
  PER = 'per',
  WELCH = 'welch'
}

export interface PeriodogramOptions {
  periodType: PeriodogramPeriodType,
  logscale: boolean,
  prominent: boolean,
  maxPer: number,
}

export type Options = PeriodogramOptions

export interface GetCosinorBody {
  file?: string,
  command: CosinorCommand,
  options: FormDataOptions
}

export type GetCosinorResponse = DataFramePoint[] | DataFramePoint[][]

export enum CosinorCommand {
  PERIODOGRAM = 'periodogram',
  FIT_GROUP = 'fit_group',
}

export interface FormDataOptions {
  [CosinorCommand.PERIODOGRAM]: PeriodogramOptions
  [CosinorCommand.FIT_GROUP]: PeriodogramOptions
}

export interface Graph {
  command: CosinorCommand,
  data: string,
}

export type GraphsResponse = Graph[]

export type CosinorResponseHandler = {
  [key in CosinorCommand]: (json: string) => Graph[]
}

export const cosinorResponseHandler: CosinorResponseHandler = {
  [CosinorCommand.PERIODOGRAM]: handlers.handlePeriodogram,
  [CosinorCommand.FIT_GROUP]: handlers.handleFitGroup
}

export const awaitWebSocket = <T = string>(ws: SocketIO.Socket, event: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    console.log('starting await timer on event', event)
    const timeout = setTimeout(() => {
      reject()
    }, 5000)
    ws.on(event, (data: T) => {
      try {
        resolve(data)
      } catch (err) {
        reject()
      }
    })
    ws.on('loading', () => {
      clearTimeout(timeout)
    })
    ws.on('error', (data) => {
      console.log('recieved error...', data)
      reject()
    })
    ws.on('print', (data) => {
      console.log('PRINT', data)
    })
  })
}

export const getPythonScript = async (ws: SocketIO.Socket, body: GetCosinorBody): Promise<GraphsResponse> => {

  console.log('getCosinor body', body)

  ws.emit('run', {
    command: body.command,
    file: body.file,
    options: getPythonOptions(body.command, body.options)
  })

  const response = await awaitWebSocket(ws, 'response')

  console.log('response', response)

  return cosinorResponseHandler[body.command](response)
}