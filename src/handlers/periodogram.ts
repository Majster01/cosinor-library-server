import { CosinorCommand, DataFramePoint, Graph } from '../controllers/python_scripts_handler'

export const handlePeriodogram = (json: string): Graph[] => {
  
  const pythonData: string = JSON.parse(json)

  return [{
    command: CosinorCommand.PERIODOGRAM,
    data: pythonData
  }]
}