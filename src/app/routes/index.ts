import { Router } from "express";
import { SpecialtyRoutes } from "../module/speciality/speciality.route";
import { AuthRoutes } from "../module/auth/auth.route";
import { UserRoute } from "../module/user/user.route";
import { DoctorRoute } from "../module/doctor/doctor.route";
import { AdminRoute } from "../module/admin/admin.route";
import { SuperAdminRoute } from "../module/superAdmin/superAdmin.route";
import { scheduleRoutes } from "../module/schedule/schedule.route";
import { DoctorScheduleRoutes } from "../module/doctorSchedule/doctorSchedule.route";
import { AppointmentRoutes } from "../module/appointment/appointment.route";
import { PatientRoutes } from "../module/patient/patient.route";

const router = Router();

router.use("/auth", AuthRoutes);
router.use("/specialties", SpecialtyRoutes);
router.use("/users", UserRoute);
router.use("/doctors", DoctorRoute);
router.use("/admins", AdminRoute);
router.use("/superAdmins", SuperAdminRoute);
router.use("/schedules", scheduleRoutes);
router.use("/doctor-schedules", DoctorScheduleRoutes);
router.use("/appointments", AppointmentRoutes);
router.use("/patients", PatientRoutes);


export const IndexRoutes = router;