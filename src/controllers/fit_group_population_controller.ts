import { IsString, IsEnum, IsNumber, IsBoolean } from 'class-validator'
import * as handlers from '../handlers/fit_group_population'
import { CosinorType, PeriodogramPeriodType, FileType } from '../interfaces'
import { JsonController, Post, UseBefore, Body } from 'routing-controllers'
import { spawnPythonMiddleware } from '../middleware/spawn_python'
import { WebSocket, OrNull } from '../middleware/decorators'
import { PythonResponseBody } from '../handlers/interfaces'

namespace Schemas {

  export class FitGroupPopulationBody implements handlers.FitGroupPopulationBody {
    @IsString() data!: string
    @IsEnum(FileType) fileType!: FileType
    @IsEnum(CosinorType) cosinorType!: CosinorType
    @IsNumber() period!: number
    @IsNumber({}, { each: true }) n_components!: number | number[]
    @IsBoolean() @OrNull() hasXlsxReplicates!: boolean | null
  }
}

@JsonController('/fit-group-population')
export class FitGroupPopulationController {
  
  @Post()
  @UseBefore(spawnPythonMiddleware)
  async getPythonScript (
    @WebSocket() ws: SocketIO.Socket,
    @Body() body: Schemas.FitGroupPopulationBody,
  ): Promise<PythonResponseBody> {
    return handlers.handleFitGroupPopulation(ws, body)
  }
}