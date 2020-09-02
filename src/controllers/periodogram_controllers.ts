import { IsString, IsEnum, IsNumber, IsBoolean } from 'class-validator'
import * as handlers from '../handlers/periodogram'
import { CosinorType, PeriodogramPeriodType, FileType } from '../interfaces'
import { JsonController, Post, UseBefore, Body } from 'routing-controllers'
import { spawnPythonMiddleware } from '../middleware/spawn_python'
import { WebSocket } from '../middleware/decorators'
import { PythonResponseBody } from '../handlers/interfaces'

namespace Schemas {

  export class PeriodogramBody implements handlers.PeriodogramBody {
    @IsString() data!: string
    @IsEnum(FileType) fileType!: FileType
    @IsEnum(CosinorType) cosinorType!: CosinorType
    @IsEnum(PeriodogramPeriodType) per_type!: PeriodogramPeriodType
    @IsNumber() max_per!: number
    @IsNumber() min_per!: number
    @IsBoolean() logscale!: boolean
    @IsBoolean() prominent!: boolean
  }
}

@JsonController('/periodogram')
export class PeriodogramController {
  
  @Post()
  @UseBefore(spawnPythonMiddleware)
  async getPythonScript (
    @WebSocket() ws: SocketIO.Socket,
    @Body() body: Schemas.PeriodogramBody,
  ): Promise<PythonResponseBody> {
    return handlers.handlePeriodogram(ws, body)
  }
}