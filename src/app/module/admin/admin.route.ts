import { Router } from "express";
import { AdminController } from "./admin.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { adminValidation } from "./admin.validation";

const router = Router();

router.get("/", AdminController.getAllAdmins);
router.get("/:id", AdminController.getAdminById);
router.delete("/:id", AdminController.softDeleteAdmin);
router.patch("/:id", validateRequest(adminValidation.adminUpdateZodSchema), AdminController.updateAdminData);

export const AdminRoute = router;