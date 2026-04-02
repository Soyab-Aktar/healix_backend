import express, { Application, NextFunction, Request, Response } from "express";
import { IndexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notfound } from "./app/middleware/notFound";

const app: Application = express();
// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

app.use("/api/v1", IndexRoutes);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Hello,This Backend of Healix');
  // console.log('Hello,This Backend of Healix');
});

app.use(globalErrorHandler);
app.use(notfound);

export default app;
