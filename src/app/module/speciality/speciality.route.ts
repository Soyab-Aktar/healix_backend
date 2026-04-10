import { Router } from "express";
import { SpecialtyController } from "./speciality.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post('/', checkAuth(Role.SUPER_ADMIN, Role.ADMIN), SpecialtyController.createSpeciality);
router.get('/', SpecialtyController.getAllSpeciality);
router.delete('/:id', checkAuth(Role.SUPER_ADMIN, Role.ADMIN), SpecialtyController.deleteSpeciality);
router.patch('/:id', checkAuth(Role.SUPER_ADMIN, Role.ADMIN), SpecialtyController.updateSpeciality);

export const SpecialtyRoutes = router;