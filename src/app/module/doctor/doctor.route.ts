import { Router } from "express";
import { DoctorController } from "./doctor.controller";

const router = Router();

router.get("/", DoctorController.getAllDoctors);

// Update , Get by id, soft delete

export const DoctorRoute = router;