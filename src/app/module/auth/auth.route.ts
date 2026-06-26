import { Router } from "express";
import { AuthController } from "./auth.controller";
import { checkAuth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { authValidation } from "./auth.validation";

const router = Router();

router.post("/register", validateRequest(authValidation.registerZodSchema), AuthController.registerPatient);
router.post("/login", validateRequest(authValidation.loginZodSchema), AuthController.loginUser);
router.get("/me", checkAuth(Role.DOCTOR, Role.ADMIN, Role.SUPER_ADMIN, Role.PATIENT), AuthController.getMe);
router.post("/refresh-token", AuthController.getNewToken);
router.post("/change-password", checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT), validateRequest(authValidation.changePasswordZodSchema), AuthController.changePassword);
router.post("/logout", checkAuth(Role.SUPER_ADMIN, Role.ADMIN, Role.DOCTOR, Role.PATIENT), AuthController.logOutUser);
router.post("/verify-email", validateRequest(authValidation.verifyEmailZodSchema), AuthController.verifyEmail);
router.post("/forgot-password", validateRequest(authValidation.forgotPasswordZodSchema), AuthController.forgotPassword);
router.post("/reset-password", validateRequest(authValidation.resetPasswordZodSchema), AuthController.resetPassword);

router.get("/login/google", AuthController.googleLogin);
router.get("/google/success", AuthController.googleLoginSuccess);
router.get("/oauth/error", AuthController.handleOAuthError);

export const AuthRoutes = router;