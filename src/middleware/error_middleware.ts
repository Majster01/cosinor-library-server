import {Middleware, ExpressErrorMiddlewareInterface, HttpError} from "routing-controllers";

@Middleware({ type: "after" })
export class CustomErrorHandler implements ExpressErrorMiddlewareInterface {

  use () {
    console.log('CustomErrorHandler use')
  }
  // tslint:disable-next-line:no-any
  error (error: any, request: any, response: any, next: (err: any) => any) {
    console.log('CustomErrorHandler error', error, request.body)
    next(new HttpError(500, 'Unexpected Error'));
  }
}