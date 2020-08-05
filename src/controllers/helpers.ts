import { CosinorAnalysisCommand, FormDataOptions, CosinorType } from "./python_scripts_handler"

interface PythonKeyMap {
  [key: string]: string | undefined
}

const pythonKeyMap: PythonKeyMap = {
  periodType: 'per_type',
  logScale: 'logscale',
  prominent: 'prominent',
  maxPeriod: 'max_per',
  components: 'n_components',
  period: 'period',
}

export interface GeneralObject {
  // tslint:disable-next-line:no-any
  [key: string]: any
}

export const getPythonOptions = (options: GeneralObject): object => {
  return Object.keys(options).reduce((pythonOptions: object, key: string) => {
    const pythonKey: string | undefined = pythonKeyMap[key]

    if (pythonKey !== undefined) {
      return {
        ...pythonOptions,
        [pythonKey]: options[key]
      }
    }

    return pythonOptions
  }, {})
}