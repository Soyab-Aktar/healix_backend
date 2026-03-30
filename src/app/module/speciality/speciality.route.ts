import { Router } from "express";
import { SpecialtyController } from "./speciality.controller";

const router = Router();

router.post('/', SpecialtyController.createSpeciality);
router.get('/', SpecialtyController.getAllSpeciality);
router.delete('/:id', SpecialtyController.deleteSpeciality);
router.patch('/:id', SpecialtyController.updateSpeciality);

export const SpecialtyRoutes = router;