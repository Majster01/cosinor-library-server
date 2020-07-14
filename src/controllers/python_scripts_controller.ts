import * as handlers from './python_scripts_handler'
import { JsonController, Get, UseBefore, QueryParams, HttpCode, Post, Body } from 'routing-controllers'
import { IsEmail, IsString, IsUUID, IsEnum, IsJWT, IsNumber, IsDate, IsArray, IsInstance, IsObject } from 'class-validator'
import {  OrUndefined, WebSocket } from '../middleware/decorators'
import { spawnPythonMiddleware } from '../middleware/spawn_python'
import * as SocketIO from 'socket.io'

namespace Schemas {

  export class GetCosinorBody implements handlers.GetCosinorBody {
    @IsString() @OrUndefined() file?: string
    @IsEnum(handlers.CosinorCommand) command!: handlers.CosinorCommand
    @IsObject() options!: handlers.FormDataOptions
  }
}

@JsonController('/cosinor')
export class WorklogController {
  
  @Post()
  @UseBefore(spawnPythonMiddleware)
  async getPythonScript (
    @WebSocket() ws: SocketIO.Socket,
    @Body() body: Schemas.GetCosinorBody,
  ): Promise<handlers.GraphsResponse> {
    return handlers.getPythonScript(ws, body)
  }
}