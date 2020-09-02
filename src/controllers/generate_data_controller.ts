import * as handlers from '../handlers/generate_data'
import { JsonController, UseBefore, Post, Body } from 'routing-controllers'
import { IsNumber } from 'class-validator'
import {  OrUndefined, WebSocket } from '../middleware/decorators'
import { spawnPythonMiddleware } from '../middleware/spawn_python'
import * as SocketIO from 'socket.io'

namespace Schemas {

  export class GenerateDataBody implements handlers.GenerateDataBody {
    @IsNumber({}, { each: true}) @OrUndefined() components?: number | number[]
    @IsNumber() @OrUndefined() period?: number
    @IsNumber({}, { each: true}) @OrUndefined() amplitudes?: number[]
    @IsNumber() @OrUndefined() noise?: number
    @IsNumber() @OrUndefined() replicates?: number
  }
}

@JsonController('/generate-data')
export class GenerateDataController {
  
  @Post()
  @UseBefore(spawnPythonMiddleware)
  async getPythonScript (
    @WebSocket() ws: SocketIO.Socket,
    @Body() body: Schemas.GenerateDataBody,
  ): Promise<string> {
    return handlers.runPythonGenerateData(ws, body)
  }
}