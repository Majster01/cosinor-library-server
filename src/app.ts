import * as express from 'express'
import { Application } from 'express'
import {createExpressServer} from "routing-controllers";
import { Config } from './interfaces';
import * as SocketIO from 'socket.io'
import * as http from 'http'
import { v4 } from 'uuid'

export class App {
    app: Application
    port: number

    constructor (config: Config) {
        this.app = express()
        this.port = config.port

        this.app = createExpressServer(config)
    }

    listen () {
        const server = this.app.listen(this.port, () => {
            console.log(`App listening on the http://localhost:${this.port}`)
        })
              
        // socketIoServer.of(`/python-library`).on('connection', (socket: SocketIO.Socket) => {
        //     socket.emit('run', 'manual')
        //     socket.on('response', (data) => {
        //         console.log('response recieved', data)
        //     })
        // });
      
        return server
    }

    createSocketIOServer (server: http.Server) {

        return SocketIO.listen(server)
    }

}
