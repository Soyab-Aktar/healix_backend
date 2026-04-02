import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { createDoctorZodSchema } from "./user.validation";

const router = Router();

router.post("/create-doctor", validateRequest(createDoctorZodSchema), UserController.createDoctor);
// router.post("/create-Admin", UserController.createDoctor);
// router.post("/create-SuperAdmin", UserController.createDoctor);

export const UserRoute = router;

