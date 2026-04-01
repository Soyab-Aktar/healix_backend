import { Router } from "express";
import { UserController } from "./user.controller";

const router = Router();

router.post("/create-doctor", UserController.createDoctor);
// router.post("/create-Admin", UserController.createDoctor);
// router.post("/create-SuperAdmin", UserController.createDoctor);

export const UserRoute = router;