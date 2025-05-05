import express from "express";
import clientRoutes from "./routes/clientRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Rute
app.use("/api/clients", clientRoutes);

app.use("/api/appointments", appointmentRoutes);

app.listen(PORT, () => {
  console.log(`Serverul rulează pe http://localhost:${PORT}`);
});


