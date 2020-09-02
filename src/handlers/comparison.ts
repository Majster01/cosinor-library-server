import { awaitWebSocket } from '../python/helpers'
import { PythonResponseBody } from './interfaces'
import { CosinorType, FitType, FileType } from '../interfaces'

export type Tuple = [string, string]

export interface ComparisonBody {
  fileType: FileType
  data: string
  fitType: FitType
  cosinorType: CosinorType
  n_components: number | number[],
  period: number,
  pairs: Tuple[]
}

export const handleComparison = async (ws: SocketIO.Socket, body: ComparisonBody): Promise<PythonResponseBody> => {
  
  const {
    data,
    cosinorType,
    fitType,
    fileType,
    ...rest
  } = body
  
  if (fitType === FitType.INDEPENDENT) {
    ws.emit('comparison_independent', {
      cosinorType,
      fileType,
      options: {
        data,
        ...rest,
      }
    })
  } else {
    ws.emit('comparison_population', {
      cosinorType,
      fileType,
      options: {
        data,
        ...rest,
      }
    })
  }

  const response = await awaitWebSocket(ws, 'response')

  const pythonData: PythonResponseBody = JSON.parse(response)

  return pythonData
}