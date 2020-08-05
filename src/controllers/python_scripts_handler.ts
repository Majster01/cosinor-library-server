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

export interface RunAnalysisBody {
  data: string,
  command: CosinorAnalysisCommand,
  cosinorType: CosinorType
  options: FormDataOptions
}

export interface GenerateDataBody {
  components?: number | number[],
  period?: number,
  amplitudes?: number,
  noise?: number,
}

export type GetCosinorResponse = DataFramePoint[] | DataFramePoint[][]

export enum CosinorAnalysisCommand {
  PERIODOGRAM = 'periodogram',
  FIT_GROUP = 'fit_group',
}

export enum GeneralCommand {
  GENERATE_DATA = 'generate_data'
}

export type Command = CosinorAnalysisCommand | GeneralCommand

export interface FormDataOptions {
  [CosinorAnalysisCommand.PERIODOGRAM]: PeriodogramOptions
  [CosinorAnalysisCommand.FIT_GROUP]: FitGroupOptions
}

export interface Graph {
  command: CosinorAnalysisCommand,
  data: string,
}

export type GraphsResponse = Graph[]

export type CosinorResponseHandler = {
  [key in CosinorAnalysisCommand]: (json: string) => Graph[]
}

export const cosinorResponseHandler: CosinorResponseHandler = {
  [CosinorAnalysisCommand.PERIODOGRAM]: handlers.handlePeriodogram,
  [CosinorAnalysisCommand.FIT_GROUP]: handlers.handleFitGroup
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

export const runPythonCosinorAnalysis = async (ws: SocketIO.Socket, body: RunAnalysisBody): Promise<GraphsResponse> => {

  console.log('getCosinor body', body)

  console.log('OPTIONS', getPythonOptions(body.options))

  const options = getPythonOptions(body.options)

  ws.emit('run', {
    command: body.command,
    cosinorType: body.cosinorType,
    options: {
      data: body.data,
      ...options,
    }
  })

  const response = await awaitWebSocket(ws, 'response')

  console.log('response', response)

  return cosinorResponseHandler[body.command](response)
}

export const runPythonGenerateData = async (ws: SocketIO.Socket, body: GenerateDataBody): Promise<string> => {

  console.log('getCosinor body', body)

  const {
    components,
    period,
    noise,
    amplitudes
  } = body

  ws.emit('run', {
    command: GeneralCommand.GENERATE_DATA,
    options: body
  })

  const response: string = await awaitWebSocket(ws, 'response')

  console.log('response', response)

  return response
}