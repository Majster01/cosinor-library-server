import * as handlers from './python_scripts_handler'
import { JsonController, Get, UseBefore, QueryParams, HttpCode, Post, Body } from 'routing-controllers'
import { IsEmail, IsString, IsUUID, IsEnum, IsJWT, IsNumber, IsDate, IsArray, IsInstance, IsObject } from 'class-validator'
import {  OrUndefined, WebSocket } from '../middleware/decorators'
import { spawnPythonMiddleware } from '../middleware/spawn_python'
import * as SocketIO from 'socket.io'

namespace Schemas {

  export class RunAnalysisBody implements handlers.RunAnalysisBody {
    @IsString() data!: string
    @IsEnum(handlers.CosinorAnalysisCommand) command!: handlers.CosinorAnalysisCommand
    @IsEnum(handlers.CosinorType) cosinorType!: handlers.CosinorType
    @IsObject() options!: handlers.FormDataOptions
  }
  export class GenerateDataBody implements handlers.GenerateDataBody {
    @IsNumber({}, { each: true}) @OrUndefined() components?: number | number[]
    @IsNumber() @OrUndefined() period?: number
    @IsNumber() @OrUndefined() amplitudes?: number
    @IsNumber() @OrUndefined() noise?: number
  }
}

@JsonController('/cosinor')
export class CosinorAnalysisController {
  
  @Post()
  @UseBefore(spawnPythonMiddleware)
  async getPythonScript (
    @WebSocket() ws: SocketIO.Socket,
    @Body() body: Schemas.RunAnalysisBody,
  ): Promise<handlers.GraphsResponse> {
    return handlers.runPythonCosinorAnalysis(ws, body)
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
