import { Router } from "express";
import { SuperAdminController } from "./superAdmin.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { superAdminValidation } from "./superAdmin.validation";


const router = Router();

router.get("/", SuperAdminController.getAllSuperAdmins);
router.get("/:id", SuperAdminController.getSuperAdminById);
router.delete("/:id", SuperAdminController.softDeleteSuperAdmin);
router.patch("/:id", validateRequest(superAdminValidation.superAdminUpdateZodSchema), SuperAdminController.updateSuperAdminData);

export const SuperAdminRoute = router;