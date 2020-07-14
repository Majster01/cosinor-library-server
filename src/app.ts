import * as express from 'express'
import { Application } from 'express'
import {createExpressServer} from "routing-controllers";
import { Config } from './interfaces';
import * as SocketIO from 'socket.io'
import * as ws from 'ws'

export class App {
    app: Application
    port: number
    private serviceName: string

    // tslint:disable-next-line:no-any
    constructor (config: Config) {
        this.app = express()
        this.port = config.port
        this.serviceName = config.serviceName

        this.app = createExpressServer(config)

    }

    listen () {
        const server = this.app.listen(this.port, () => {
            console.log(`App listening on the http://localhost:${this.port}`)
        })

        const io: SocketIO.Server = SocketIO.listen(server)
              
        io.of(`/python-library`).on('connection', (socket: SocketIO.Socket) => {
            socket.emit('run', 'manual')
            socket.on('response', (data) => {
                console.log('response recieved', data)
            })
        });
      
        return server
    }
}
