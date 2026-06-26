import { Router } from "express";
import { UserController } from "./user.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { userValidation } from "./user.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { multerUpload } from "../../config/multer.config";

const router = Router();

router.post("/create-doctor", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(userValidation.createDoctorZodSchema), UserController.createDoctor);

router.post("/create-Admin", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(userValidation.createAdminZodSchema), UserController.createAdmin);

router.post("/create-superAdmin", checkAuth(Role.SUPER_ADMIN), validateRequest(userValidation.createSuperAdminZodSchema), UserController.createSuperAdmin);

router.post(
  "/upload-image",
  checkAuth(Role.ADMIN, Role.SUPER_ADMIN, Role.DOCTOR, Role.PATIENT),
  multerUpload.single("file"),
  UserController.uploadImage
);

export const UserRoute = router;


