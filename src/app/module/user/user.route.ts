import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { userValidation } from "./user.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/create-doctor", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(userValidation.createDoctorZodSchema), UserController.createDoctor);

router.post("/create-Admin", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(userValidation.createAdminZodSchema), UserController.createAdmin);

router.post("/create-superAdmin", checkAuth(Role.SUPER_ADMIN), validateRequest(userValidation.createSuperAdminZodSchema), UserController.createSuperAdmin);

export const UserRoute = router;

