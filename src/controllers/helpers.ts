import { CosinorCommand, FormDataOptions } from "./python_scripts_handler"

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

export const getPythonOptions = (command: CosinorCommand, options: FormDataOptions) => {
  const commandOptions = options[command]

  console.log('options', commandOptions)

  return Object.keys(commandOptions).reduce((pythonOptions: object, key: string) => {
    const pythonKey: string | undefined = pythonKeyMap[key]

    console.log('keyMap', key, pythonKey)

    if (pythonKey !== undefined) {
      return {
        ...pythonOptions,
        [pythonKey]: commandOptions[key as keyof typeof commandOptions]
      }
    }

    return pythonOptions
  }, {})
}