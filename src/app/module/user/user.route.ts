import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { userValidation } from "./user.validation";

const router = Router();

router.post("/create-doctor", validateRequest(userValidation.createDoctorZodSchema), UserController.createDoctor);
router.post("/create-Admin", validateRequest(userValidation.createAdminZodSchema), UserController.createAdmin);
router.post("/create-superAdmin", validateRequest(userValidation.createSuperAdminZodSchema), UserController.createSuperAdmin);

export const UserRoute = router;

