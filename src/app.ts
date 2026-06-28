import express, { Application, Request, Response } from "express";
import { IndexRoutes } from "./app/routes";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import { notfound } from "./app/middleware/notFound";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import cors from "cors";
import { envVars } from "./app/config/env";
import qs from "qs";
import { PaymentController } from "./app/module/payment/payment.controller";
import cron from "node-cron";
import { AppointmentService } from "./app/module/appointment/appointment.service";
import { ScheduleService } from "./app/module/schedule/schedule.service";
import { apiLogger } from "./app/middleware/apiLogger";

const app: Application = express();
app.set("query parser", (str: string) => qs.parse(str));
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), `src/app/templates`));

app.use(apiLogger);
app.use("/api/auth", toNodeHandler(auth));
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  PaymentController.handlerStripeWebhookEvent,
);
app.use(
  cors({
    origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

cron.schedule("*/25 * * * *", async () => {
  try {
    console.log("Running cron job to cancel unpaid appointments...");
    await AppointmentService.cancelUnpaidAppointments();
  } catch (err: any) {
    console.error(
      "Error occured while canceling unpaid appointments:",
      err.message,
    );
  }
});

cron.schedule("*/30 * * * *", async () => {
  try {
    console.log("Running cron job to clean up past unallocated schedules...");
    const result = await ScheduleService.cleanupPastSchedules();
    console.log(
      `Cleaned up past schedules: soft-deleted ${result.softDeletedCount} schedules, hard-deleted ${result.hardDeletedCount} old schedules.`,
    );
  } catch (err: any) {
    console.error(
      "Error occurred while cleaning up past schedules:",
      err.message,
    );
  }
});

app.use("/api/v1", IndexRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("Hello,This Backend of Healix");
});

app.use(globalErrorHandler);
app.use(notfound);

export default app;
