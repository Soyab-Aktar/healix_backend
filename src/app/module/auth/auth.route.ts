import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router();

router.post("/register", AuthController.registerPatient);
router.post("/login", AuthController.loginUser);
router.get("/me", AuthController.getMe);
router.post("/refresh-token", AuthController.getNewToken);


export const AuthRoutes = router;