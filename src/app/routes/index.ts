import { Router } from "express";
import { SpecialtyRoutes } from "../module/speciality/speciality.route";
import { AuthRoutes } from "../module/auth/auth.route";

const router = Router();

router.use("/auth", AuthRoutes)
router.use("/specialties", SpecialtyRoutes);


export const IndexRoutes = router;