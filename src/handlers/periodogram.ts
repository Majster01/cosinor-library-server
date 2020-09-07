import { awaitWebSocket } from '../python/helpers'
import { PythonResponseBody } from './interfaces'
import { CosinorType, PeriodogramPeriodType, FileType } from '../interfaces'

export interface PeriodogramBody {
  fileType: FileType
  data: string
  cosinorType: CosinorType
  max_per: number
  min_per: number
  per_type: PeriodogramPeriodType
  logscale: boolean
  hasXlsxReplicates: boolean | null
}

export const handlePeriodogram = async (ws: SocketIO.Socket, body: PeriodogramBody): Promise<PythonResponseBody> => {

  const {
    data,
    fileType,
    cosinorType,
    ...rest
  } = body
  
  ws.emit('periodogram', {
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