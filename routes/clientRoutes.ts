import express from "express";
import { getAllClients, createClient, getClientById, deleteClientById, updateClientById} from "../controllers/clientController";
import { addCarToClient, updateCarById, getCarsByClientId, deleteCarById} from "../controllers/clientController";

const router = express.Router();

router.get("/", getAllClients);
router.post("/", createClient);
router.get("/:id", getClientById);
router.delete("/:id", deleteClientById);
router.put("/:id", updateClientById);

router.post("/:id/cars", addCarToClient);
router.put("/:clientId/cars/:carId", updateCarById);
router.get("/:clientId/cars",getCarsByClientId);
router.delete("/:clientId/cars/:carId", deleteCarById);

export default router;
 