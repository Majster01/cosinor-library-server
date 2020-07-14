import {registerDecorator, ValidationOptions, ValidationArguments, ValidateIf} from "class-validator";
import { createParamDecorator } from "routing-controllers";
import * as SocketIO from 'socket.io'

export function WebSocket () {
  return createParamDecorator({
      required: true,
      value: (action): SocketIO.Socket => {
          return action.request.webSocket
      }
  });
}

export function OrUndefined (validationOptions?: ValidationOptions): PropertyDecorator {
   // tslint:disable-next-line:ban-types
   return (target: Object, propertyKey: string | symbol) => {
    // tslint:disable-next-line:no-any
    ValidateIf((object: any, _value: any) => object[propertyKey] !== undefined, validationOptions)(target, propertyKey as string)
    registerDecorator({
      name: "orUndefined",
      target: target.constructor,
      propertyName: propertyKey as string,
      constraints: undefined,
      options: validationOptions,
      validator: {
        // tslint:disable-next-line:no-any
        validate (_value: any, _args: ValidationArguments): boolean {
          return true
        }
      }
    });
  };
}

export function OrNull (validationOptions?: ValidationOptions): PropertyDecorator {
   // tslint:disable-next-line:ban-types
   return (target: Object, propertyKey: string | symbol) => {
    // tslint:disable-next-line:no-any
    ValidateIf((object: any, _value: any) => object[propertyKey] !== null, validationOptions)(target, propertyKey as string)
    registerDecorator({
      name: "orNull",
      target: target.constructor,
      propertyName: propertyKey as string,
      constraints: undefined,
      options: validationOptions,
      validator: {
        // tslint:disable-next-line:no-any
        validate (_value: any, _args: ValidationArguments): boolean {
          return true
        }
      }
    });
  };
}