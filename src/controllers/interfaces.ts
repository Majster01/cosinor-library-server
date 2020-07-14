import { Router } from "express";

export interface Controller {
  initRoutes: Function
  router: Router
}
