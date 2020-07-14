import * as dotenv from 'dotenv'
dotenv.config()

import { App } from './app'

import { loggerMiddleware } from './middleware/logger'
import { CONTROLLERS } from './controllers'
import { Config } from './interfaces'
import { port } from './conf'
import * as http from 'http'
import { CustomErrorHandler } from './middleware/error_middleware'
import * as express from 'express'

const whitelist = ['http://localhost:3000', 'http://localhost:5000', undefined]
const corsOptions = {
  // tslint:disable-next-line:no-any
  origin (origin: string, callback: any) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}

const config: Config = {
  serviceName: 'abc-admin-panel',
  routePrefix: '/v1',
  port,
  cors: corsOptions,
  controllers: CONTROLLERS,
  defaultErrorHandler: false,
  middlewares: [
    express.json(),
    express.urlencoded({ extended: true }),
    loggerMiddleware,
    CustomErrorHandler
  ],
  validation: {
    forbidUnknownValues: true,
    whitelist: true,

  },
  defaults: {
    paramOptions: {
      required: true
    }
  },
}

const app: App = new App(config)

export const server: http.Server = app.listen()
