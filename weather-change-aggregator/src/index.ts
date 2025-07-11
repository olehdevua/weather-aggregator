import WebSocket from "ws";
import { Request, Response } from "express";
import { WsServer } from "./servers/ws.server";
import { HttpServer } from "./servers/http.server";
import { WeatherHttpController } from "./weather/weather.http.controller";
import { BaseError } from "./lib/errors";
import { WeatherWsController } from "./weather/weather.ws.controller";
import { LoggerService } from "./core/logger.service";
import { AuthService } from "./core/auth.service";

export async function runExpress() {
  const httpServer = HttpServer.init();
  const weatherController = await WeatherHttpController.init();
  const authService = AuthService.init();

  await httpServer.run((app) => {
    app.use("/weather", (req: Request, _res: Response, next: (err?: Error) => void) => {
      authService
        .authenticate(req.headers.authorization)
        .then(() => next())
        .catch(next);
    });
    app.use("/weather", (req: Request, _res: Response, next: (err?: Error) => void) => {
      authService
        .authorize(req.headers.authorization)
        .then(() => next())
        .catch(next);
    });

    app.get("/weather", (req: Request, res: Response, next: (err: Error) => void) => {
      weatherController.list(req, res).catch(next);
    });
    app.post("/weather", (req: Request, res: Response, next: (err: Error) => void) => {
      weatherController.create(req, res).catch(next);
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    app.use((err: unknown, _req: Request, res: Response, _next: (err: Error) => void) => {
      const { body, httpStatus } = BaseError.toResponse(err);

      res.status(httpStatus).json({ error: body });
    });
  });

  return httpServer;
}

export async function runWs() {
  const { logger } = LoggerService.init();

  const wsServer = WsServer.init();
  const weatherWsController = await WeatherWsController.init();

  await wsServer.run((ws) => {
    ws.on("message", (data: WebSocket.Data) => {
      weatherWsController.create(ws, data).catch((err: unknown) => {
        const { body } = BaseError.toResponse(err);
        logger.error(body);
      });
    });
  });
}

export async function main() {
  await runExpress();
  await runWs();
}
