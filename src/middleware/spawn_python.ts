import * as SocketIO from 'socket.io'
import { socketIoServer } from '../index'
import * as uuid from 'uuid'
import { Request, Response } from '../interfaces'

const awaitConnection = async (ws: SocketIO.Namespace): Promise<SocketIO.Socket> => new Promise((resolve, reject) => {

  const rejectTimeout = setTimeout(() => {
    reject()
  }, 5000)
  ws.on('connection', (socket: SocketIO.Socket) => {
    console.log('connection recieved', socket.id)
    clearTimeout(rejectTimeout)
    resolve(socket)
  })
})

const createSocketNamespace = (uuid: string) => {
        
  return socketIoServer.of(`/python-library/${uuid}`)
}

// tslint:disable-next-line:no-any
export const spawnPythonMiddleware = async (req: Request, res: Response, next: any) => {
  const socketConnectionUuid: string = uuid.v4()

  const namespace = createSocketNamespace(socketConnectionUuid)

  const spawn = require("child_process").spawn;
  const pythonProcess = spawn("python", ["./python_socket.py", socketConnectionUuid], {
    detached: true,
  });

  pythonProcess.stdout.on("data", (data: Buffer) => {
    console.log("pythonProcess.stdout.on data")
    console.log(data.toString())
  });
  pythonProcess.stderr.on("data", (data: Buffer) => {
    console.log("pythonProcess.stdout.on error", data)
    console.log('data: ', data.toString())
  });

  // tslint:disable-next-line:no-any
  pythonProcess.on('exit', (code: any, signal: any) => {
    console.log(socketConnectionUuid, 'child process exited with ' +
                `code ${code} and signal ${signal}`);
  })

  // tslint:disable-next-line:no-any
  pythonProcess.on('close', (code: any, signal: any) => {
    console.log(socketConnectionUuid, 'close', code, signal);
  })

  req.webSocket = await awaitConnection(namespace)

  next()
}
