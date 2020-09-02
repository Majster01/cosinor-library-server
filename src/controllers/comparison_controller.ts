import { IsString, IsEnum, IsNumber, IsArray } from 'class-validator'
import * as handlers from '../handlers/comparison'
import { CosinorType, FitType, FileType } from '../interfaces'
import { JsonController, Post, UseBefore, Body } from 'routing-controllers'
import { spawnPythonMiddleware } from '../middleware/spawn_python'
import { WebSocket } from '../middleware/decorators'
import { PythonResponseBody } from '../handlers/interfaces'

namespace Schemas {

  export class ComparisonBody implements handlers.ComparisonBody {
    @IsString() data!: string
    @IsEnum(FileType) fileType!: FileType
    @IsEnum(CosinorType) cosinorType!: CosinorType
    @IsEnum(FitType) fitType!: FitType
    @IsNumber() period!: number
    @IsNumber({}, { each: true }) n_components!: number | number[]
    @IsArray({ each: true }) pairs!: handlers.Tuple[]
  }
}

@JsonController('/comparison')
export class ComparisonController {
  
  @Post()
  @UseBefore(spawnPythonMiddleware)
  async getPythonScript (
    @WebSocket() ws: SocketIO.Socket,
    @Body() body: Schemas.ComparisonBody,
  ): Promise<PythonResponseBody> {
    return handlers.handleComparison(ws, body)
  }
}