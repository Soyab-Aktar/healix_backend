import { Router } from "express";
import { AdminController } from "./admin.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { adminValidation } from "./admin.validation";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), AdminController.getAllAdmins);
router.get("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), AdminController.getAdminById);
router.delete("/:id", checkAuth(Role.SUPER_ADMIN), AdminController.softDeleteAdmin);
router.patch("/:id", checkAuth(Role.SUPER_ADMIN), validateRequest(adminValidation.adminUpdateZodSchema), AdminController.updateAdminData);

export const AdminRoute = router;