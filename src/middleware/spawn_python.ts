import * as SocketIO from 'socket.io'
import { server } from '../index'
import * as uuid from 'uuid'
import * as ws from 'ws'
import { Request, Response } from '../interfaces'

// tslint:disable-next-line:no-any
const createSocket = (uuid: string) => {

  const io: SocketIO.Server = SocketIO.listen(server)
        
  return io.of(`/python-library/${uuid}`)
}

// tslint:disable-next-line:no-any
export const spawnPythonMiddleware = (req: Request, res: Response, next: any) => {
  const socketConnectionUuid: string = uuid.v4()

  console.log("spawnPythonMiddleware", socketConnectionUuid);
  const ws = createSocket(socketConnectionUuid)

  const spawn = require("child_process").spawn;
  const pythonProcess = spawn("python", ["./python_socket.py", socketConnectionUuid]);

  pythonProcess.stdout.on("data", (data: Buffer) => {
    console.log("pythonProcess.stdout.on data")
    console.log(data.toString())
  });
  pythonProcess.stderr.on("data", (data: Buffer) => {
    console.log("pythonProcess.stdout.on error")
    console.log(data.toString())
  });

  ws.on('connection', (socket: SocketIO.Socket) => {
    console.log('connection recieved', socket.id)
    req.webSocket = socket

    next()
})
}
