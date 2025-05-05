import express from "express";
import {
  getAllAppointments,
  getAppointmentById,
  createAppointment,
  deleteAppointmentById,
  getAppointmentHistory,
  updateAppointmentHistory
} from "../controllers/appointmentController";

const router = express.Router();

router.get("/", getAllAppointments);
router.get("/:id", getAppointmentById);
router.post("/", createAppointment);
router.delete("/:id", deleteAppointmentById);

router.get("/:id/history", getAppointmentHistory);
router.put("/:id/history", updateAppointmentHistory);

export default router;
