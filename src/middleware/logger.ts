import { Request, Response } from 'express'

// tslint:disable-next-line:no-any
export const loggerMiddleware = (req: Request, resp: Response, next: any) => {

    console.log('Request logged:', req.method, req.path)
    next()
}
