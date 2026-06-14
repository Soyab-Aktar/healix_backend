import { Router } from "express";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { PaymentController } from "./payment.controller";


const router = Router();
router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), PaymentController.getAllPayments);

export const PaymentRoute = router;