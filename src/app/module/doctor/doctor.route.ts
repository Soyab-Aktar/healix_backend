import { Router } from "express";
import { DoctorController } from "./doctor.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { doctorValidation } from "./doctor.validation";

const router = Router();

router.get("/", DoctorController.getAllDoctors);
router.get("/:id", DoctorController.getDoctorsById);
router.delete("/:id", DoctorController.softDeleteDoctor);
router.patch("/:id", validateRequest(doctorValidation.updateDoctorValidationSchema), DoctorController.updateDoctorData);

export const DoctorRoute = router;