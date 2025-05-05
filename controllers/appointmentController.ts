
import { Request, Response } from "express";
import { db } from "../db";
import { Appointment, ContactMethod } from "../models/appointment";
import { v4 as uuidv4 } from "uuid";

const WORK_START = 8;
const WORK_END = 17;

function isValidContact(m: any): m is ContactMethod {
  return ["email", "phone", "inPerson"].includes(m);
}


export const getAllAppointments = (req: Request, res: Response): void => {
  db.read();
  let appts = db.data!.appointments;

  const { clientId, date, action, contactMethod } = req.query;

  if (clientId && typeof clientId === "string") {
    appts = appts.filter(a => a.clientId === clientId);
  }

  if (date && typeof date === "string") {
    appts = appts.filter(a => a.date === date);
  }

  if (action && typeof action === "string") {
    const q = action.toLowerCase();
    appts = appts.filter(a => a.action.toLowerCase().includes(q));
  }

  if (contactMethod && typeof contactMethod === "string") {
    appts = appts.filter(a => a.contactMethod === contactMethod);
  }

  res.json(appts);
};

export const getAppointmentById = (req: Request, res: Response): void => {
  db.read();
  const appt = db.data!.appointments.find(a => a.id === req.params.id);
  if (!appt) {
    res.status(404).json({ message: "Programarea nu a fost găsită." });
    return;
  }
  res.json(appt);
};

export const createAppointment = (req: Request, res: Response): void => {
  db.read();
  const {
    clientId,
    carId,
    contactMethod,
    action,
    date,
    time,
    duration
  } = req.body;

 
  if (
    !clientId || !carId || !contactMethod ||
    !action || !date || !time || duration == null
  ) {
    res.status(400).json({ message: "Datele programării sunt incomplete." });
    return;
  }


  const client = db.data!.clients.find(c => c.id === clientId);
  if (!client) {
    res.status(400).json({ message: "Client invalid." });
    return;
  }
  if (!client.cars.find(c => c.id === carId)) {
    res.status(400).json({ message: "Mașină invalidă pentru acest client." });
    return;
  }

  
  if (!isValidContact(contactMethod)) {
    res.status(400).json({ message: "contactMethod invalid." });
    return;
  }

  
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    res.status(400).json({ message: "Format date invalid. Folosește YYYY-MM-DD." });
    return;
  }
  if (!/^\d{2}:\d{2}$/.test(time)) {
    res.status(400).json({ message: "Format time invalid. Folosește HH:mm." });
    return;
  }

  const [year, month, day] = date.split('-').map(Number);
  const [hour, minute] = time.split(':').map(Number);
  const start = new Date(year, month - 1, day, hour, minute);
  if (isNaN(start.getTime())) {
    res.status(400).json({ message: "Date/time invalid." });
    return;
  }

  // 5. Verificare interval 8–17 și multiplu de 30'
  const h = start.getHours(), m = start.getMinutes();
  if (h < WORK_START || h >= WORK_END || m % 30 !== 0) {
    res.status(400).json({
      message: `Programarea trebuie între ${WORK_START}:00–${WORK_END}:00, la multiplu de 30 minute.`
    });
    return;
  }

  
  if (typeof duration !== "number" || duration % 30 !== 0) {
    res.status(400).json({ message: "duration trebuie multiplu de 30 minute." });
    return;
  }
  const end = new Date(start.getTime() + duration * 60_000);
  if (
    end.getHours() > WORK_END ||
    (end.getHours() === WORK_END && end.getMinutes() > 0)
  ) {
    res.status(400).json({ message: "Programarea depășește ora 17:00." });
    return;
  }

 
  const appt: Appointment = {
    id: uuidv4(),
    clientId,
    carId,
    contactMethod,
    action,
    date,
    time,
    duration
  };
  db.data!.appointments.push(appt);
  db.write();

  res.status(201).json(appt);
};


export const deleteAppointmentById = (req: Request, res: Response): void => {
  db.read();
  const idx = db.data!.appointments.findIndex(a => a.id === req.params.id);
  if (idx === -1) {
    res.status(404).json({ message: "Programarea nu a fost găsită pentru ștergere." });
    return;
  }
  db.data!.appointments.splice(idx, 1);
  db.write();
  res.json({ message: "Programarea a fost ștearsă cu succes." });
};

export const getAppointmentHistory = (req: Request, res: Response): void => {
  db.read();
  const appt = db.data!.appointments.find(a => a.id === req.params.id);
  if (!appt) {
    res.status(404).json({ message: "Programarea nu a fost găsită." });
    return;
  }
  const { receptionNotes, processingNotes, repairDuration } = appt;
  res.json({ receptionNotes, processingNotes, repairDuration });
};


export const updateAppointmentHistory = (req: Request, res: Response): void => {
  db.read();
  const appt = db.data!.appointments.find(a => a.id === req.params.id);
  if (!appt) {
    res.status(404).json({ message: "Programarea nu a fost găsită pentru istoric." });
    return;
  }
  const { receptionNotes, processingNotes, repairDuration } = req.body;
  // validare fields
  const invalid = [];
  if (receptionNotes !== undefined && typeof receptionNotes !== 'string') invalid.push('receptionNotes');
  if (processingNotes !== undefined && typeof processingNotes !== 'string') invalid.push('processingNotes');
  if (repairDuration !== undefined && (typeof repairDuration !== 'number' || repairDuration % 10 !== 0)) invalid.push('repairDuration');
  if (invalid.length) {
    res.status(400).json({ message: `Câmpuri invalide: ${invalid.join(', ')}` });
    return;
  }
  if (receptionNotes !== undefined) appt.receptionNotes = receptionNotes;
  if (processingNotes !== undefined) appt.processingNotes = processingNotes;
  if (repairDuration !== undefined) appt.repairDuration = repairDuration;
  db.write();
  res.json({ message: "Istoricul a fost actualizat cu succes.", history: { receptionNotes: appt.receptionNotes, processingNotes: appt.processingNotes, repairDuration: appt.repairDuration } });
};

