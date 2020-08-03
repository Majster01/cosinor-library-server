import { CosinorCommand, DataFramePoint, Graph } from '../controllers/python_scripts_handler'

export const handlePeriodogram = (json: string): Graph[] => {
  
  const pythonData: string[] = JSON.parse(json)

  const graphs: Graph[] = pythonData.map((data: string) => ({
    command: CosinorCommand.PERIODOGRAM,
    data,
  }))

  return graphs
}