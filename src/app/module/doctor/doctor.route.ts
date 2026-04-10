import { Router } from "express";
import { DoctorController } from "./doctor.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { updateDoctorZodSchema } from "./doctor.validation";

const router = Router();

router.get("/", DoctorController.getAllDoctors);
router.get("/:id", DoctorController.getDoctorsById);
router.delete("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), DoctorController.softDeleteDoctor);
router.patch("/:id", checkAuth(Role.ADMIN, Role.SUPER_ADMIN), validateRequest(updateDoctorZodSchema), DoctorController.updateDoctorData);

export const DoctorRoute = router;