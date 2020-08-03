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

export enum CosinorType {
  COSINOR = 'general cosinor',
  COSINOR1 = 'cosinor1',
}

export interface PeriodogramOptions {
  [CosinorType.COSINOR]: {
    periodType: PeriodogramPeriodType,
    logScale: boolean,
    prominent: boolean,
    maxPeriod: number,
  },
  [CosinorType.COSINOR1]: {},
}

export interface FitGroupOptions {
  [CosinorType.COSINOR]: {
    components: number,
    period: number,
  },
  [CosinorType.COSINOR1]: {
    period: number,
  },
}

export type Options = PeriodogramOptions | FitGroupOptions

export interface GetCosinorBody {
  file?: string,
  command: CosinorCommand,
  cosinorType: CosinorType
  options: FormDataOptions
}

export type GetCosinorResponse = DataFramePoint[] | DataFramePoint[][]

export enum CosinorCommand {
  PERIODOGRAM = 'periodogram',
  FIT_GROUP = 'fit_group',
}

export interface FormDataOptions {
  [CosinorCommand.PERIODOGRAM]: PeriodogramOptions
  [CosinorCommand.FIT_GROUP]: FitGroupOptions
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

  console.log('OPTIONS', getPythonOptions(body.command, body.cosinorType, body.options))

  ws.emit('run', {
    command: body.command,
    cosinorType: body.cosinorType,
    file: body.file,
    options: getPythonOptions(body.command, body.cosinorType, body.options)
  })

  const response = await awaitWebSocket(ws, 'response')

  console.log('response', response)

  return cosinorResponseHandler[body.command](response)
}