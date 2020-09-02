import { awaitWebSocket } from '../python/helpers'

export interface GenerateDataBody {
  components?: number | number[],
  period?: number,
  amplitudes?: number[],
  noise?: number,
  replicates?: number,
}

export const runPythonGenerateData = async (ws: SocketIO.Socket, body: GenerateDataBody): Promise<string> => {

  ws.emit('generate_data', body)

  const response: string = await awaitWebSocket(ws, 'response')

  return response
}