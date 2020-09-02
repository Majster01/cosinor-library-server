import "reflect-metadata";
import { FitGroupIndependentController } from "./fit_group_independent_controller";
import { FitGroupPopulationController } from './fit_group_population_controller'
import { PeriodogramController } from "./periodogram_controllers";
import { ComparisonController } from "./comparison_controller";
import { GenerateDataController } from "./generate_data_controller";

export const CONTROLLERS: Function[] = [
  GenerateDataController,
  PeriodogramController,
  FitGroupIndependentController,
  FitGroupPopulationController,
  ComparisonController,
]
