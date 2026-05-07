import { Router } from "express";
import { SuperAdminController } from "./superAdmin.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { superAdminValidation } from "./superAdmin.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";


const router = Router();

router.get("/", checkAuth(Role.SUPER_ADMIN), SuperAdminController.getAllSuperAdmins);
router.get("/:id", checkAuth(Role.SUPER_ADMIN), SuperAdminController.getSuperAdminById);
router.delete("/:id", checkAuth(Role.SUPER_ADMIN), SuperAdminController.softDeleteSuperAdmin);
router.patch(
  "/:id",
  checkAuth(Role.SUPER_ADMIN),
  validateRequest(superAdminValidation.superAdminUpdateZodSchema),
  SuperAdminController.updateSuperAdminData
);
router.patch("/change-user-role", checkAuth(Role.SUPER_ADMIN), SuperAdminController.changeUserRole);

export const SuperAdminRoute = router;