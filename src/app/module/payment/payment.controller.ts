import { Request, Response } from "express";
import { catchAsync } from "../../shared/catchAsync";
import { envVars } from "../../config/env";
import status from "http-status";
import { stripe } from "../../config/stripe";
import { PaymentService } from "./payment.service";
import { sendResponce } from "../../shared/sendResponce";

const handlerStripeWebhookEvent = catchAsync(async (req: Request, res: Response) => {
  const signature = req.headers['stripe-signature'] as string;
  const webhookSecret = envVars.STRIPE.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    console.error("Missing Stripe signature or webhook secret");
    return res.status(status.BAD_REQUEST).json({ message: "Missing Stripe signature or webhook secret" });
  }
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, signature, webhookSecret);
  } catch (error: any) {
    console.error("Error Processing Stripe Webhook: ", error);
    return res.status(status.BAD_REQUEST).json({ message: "Error processing Stripe Webhook" });
  }

  try {
    const result = await PaymentService.handlerStripeWebhookEvent(event);
    sendResponce(res, {
      httpStatusCode: status.OK,
      success: true,
      message: "Stripe webhook event processed successfully",
      data: result
    })
  } catch (error: any) {
    console.error("Error handleing Stripe webhook event:", error);
    return res.status(status.INTERNAL_SERVER_ERROR).json({ message: "Error handleing Stripe webhook event" });
  }
})

export const PaymentController = {
  handlerStripeWebhookEvent,
}