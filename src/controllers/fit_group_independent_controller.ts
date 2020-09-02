import { IsString, IsEnum, IsNumber, IsBoolean } from 'class-validator'
import * as handlers from '../handlers/fit_group_independent'
import { CosinorType, PeriodogramPeriodType, FileType } from '../interfaces'
import { JsonController, Post, UseBefore, Body } from 'routing-controllers'
import { spawnPythonMiddleware } from '../middleware/spawn_python'
import { WebSocket } from '../middleware/decorators'
import { PythonResponseBody } from '../handlers/interfaces'

namespace Schemas {

  export class FitGroupIndependentBody implements handlers.FitGroupIndependentBody {
    @IsString() data!: string
    @IsEnum(FileType) fileType!: FileType
    @IsEnum(CosinorType) cosinorType!: CosinorType
    @IsNumber() period!: number
    @IsNumber({}, { each: true }) n_components!: number | number[]
  }
}

@JsonController('/fit-group-independent')
export class FitGroupIndependentController {
  
  @Post()
  @UseBefore(spawnPythonMiddleware)
  async getPythonScript (
    @WebSocket() ws: SocketIO.Socket,
    @Body() body: Schemas.FitGroupIndependentBody,
  ): Promise<PythonResponseBody> {
    return handlers.handleFitGroup(ws, body)
  }
}