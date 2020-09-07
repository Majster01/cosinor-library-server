import { awaitWebSocket } from '../python/helpers'
import { PythonResponseBody } from './interfaces'
import { CosinorType, FileType } from '../interfaces'

export interface FitGroupIndependentBody {
  fileType: FileType
  data: string
  cosinorType: CosinorType
  n_components: number | number[],
  period: number,
  hasXlsxReplicates: boolean | null
}

export const handleFitGroup = async (ws: SocketIO.Socket, body: FitGroupIndependentBody): Promise<PythonResponseBody> => {
  
  const {
    data,
    cosinorType,
    fileType,
    ...rest
  } = body
  
  ws.emit('fit_group_independent', {
    cosinorType,
    fileType,
    options: {
      data,
      ...rest,
    }
  })

  const response = await awaitWebSocket(ws, 'response')

  const pythonData: PythonResponseBody = JSON.parse(response)

  return pythonData
}