import * as SocketIO from 'socket.io'

export const awaitWebSocket = <T = string>(ws: SocketIO.Socket, event: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject()
    }, 5000)
    ws.on(event, (data: T) => {
      try {
        resolve(data)
      } catch (err) {
        reject()
      }
    })
    ws.on('loading', () => {
      clearTimeout(timeout)
    })
    ws.on('error', () => {
      reject()
    })
    ws.on('print', (data) => {
      console.log('PRINT', data)
    })
  })
}
