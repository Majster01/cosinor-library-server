import { awaitWebSocket } from '../python/helpers'
import { PythonResponseBody } from './interfaces'
import { CosinorType, FitType, FileType } from '../interfaces'
import { InternalServerError } from 'routing-controllers'

export type Tuple = [string, string]

export interface ComparisonBody {
  fileType: FileType
  data: string
  fitType: FitType
  cosinorType: CosinorType
  n_components: number | number[],
  period: number,
  pairs: Tuple[],
  hasXlsxReplicates: boolean | null
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

  try {
    const response = await awaitWebSocket(ws, 'response')
  
    const pythonData: PythonResponseBody = JSON.parse(response)
  
    return pythonData
  } catch (error) {
    throw new InternalServerError('ERR_PYTHON')
  }
}