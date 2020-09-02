import { awaitWebSocket } from '../python/helpers'
import { PythonResponseBody } from './interfaces'
import { CosinorType, FileType } from '../interfaces'

export interface FitGroupPopulationBody {
  fileType: FileType
  data: string
  cosinorType: CosinorType
  n_components: number | number[],
  period: number,
}

export const handleFitGroupPopulation = async (ws: SocketIO.Socket, body: FitGroupPopulationBody): Promise<PythonResponseBody> => {
  
  const {
    data,
    cosinorType,
    fileType,
    ...rest
  } = body
  
  ws.emit('fit_group_population', {
    cosinorType,
    fileType,
    options: {
      data,
      ...rest,
    }
  })

  const response = await awaitWebSocket(ws, 'response')

  console.log('handleFitGroupPopulation RESPONSE', response)

  const pythonData: PythonResponseBody = JSON.parse(response)

  return pythonData
}