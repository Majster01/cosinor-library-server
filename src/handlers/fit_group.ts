import { CosinorCommand, DataFramePoint, Graph } from '../controllers/python_scripts_handler'

export const handleFitGroup = (json: string) => {
  
  const pythonData: string[] = JSON.parse(json)

  const graphs: Graph[] = pythonData.map((data: string) => ({
    command: CosinorCommand.FIT_GROUP,
    data,
  }))

  return graphs
}