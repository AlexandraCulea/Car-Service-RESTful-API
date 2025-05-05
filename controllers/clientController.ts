import { Request, Response } from "express";
import { Client } from "../models/client";
import { v4 as uuidv4 } from "uuid";
import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";


type Data = { clients: Client[] };
const adapter = new JSONFileSync<Data>("data/db.json");
const db = new LowSync(adapter, { clients: [] });
db.read();
db.data ||= { clients: [] };

export const getAllClients = (req: Request, res: Response): void => {
  db.read(); 
  res.json(db.data!.clients);
};

export const createClient = (req: Request, res: Response): void => {
  const { firstName, lastName, email, phoneNumbers } = req.body;

 
  if (!firstName || !lastName || !email || !Array.isArray(phoneNumbers)) {
    res.status(400).json({ message: "Datele clientului sunt incomplete sau invalide." });
    return;
  }


  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Formatul email-ului este invalid." });
    return;
  }

  if (!phoneNumbers.every(p => /^\d+$/.test(p))) {
    res.status(400).json({ message: "PhoneNumbers trebuie să fie un array de șiruri numerice." });
    return;
  }

  const newClient: Client = {
    id: uuidv4(),
    firstName,
    lastName,
    email,
    phoneNumbers,
    isActive: true,
    cars: []
  };

  db.read();
  db.data!.clients.push(newClient);
  db.write();

  res.status(201).json(newClient);
};


export const getClientById = (req: Request, res: Response): void => {
  const { id } = req.params;
  db.read();
  const client = db.data!.clients.find(c => c.id === id);

  if (!client) {
    res.status(404).json({ message: "Clientul nu a fost găsit." });
    return;
  }

  res.json(client);
};

export const deleteClientById = (req: Request, res: Response): void => {
  db.read();
  const { id } = req.params;

  const clientIndex = db.data!.clients.findIndex((c) => c.id === id);

  if (clientIndex === -1) {
    res.status(404).json({ message: "Clientul nu a fost găsit pentru ștergere." });
    return;
  }

  db.data!.clients.splice(clientIndex, 1);
  db.write();

  res.json({ message: "Clientul a fost șters cu succes." });
};

export const updateClientById = (req: Request, res: Response): void => {
  db.read();
  const { id } = req.params;
  const client = db.data!.clients.find(c => c.id === id);

  if (!client) {
    res.status(404).json({ message: "Clientul nu a fost găsit pentru actualizare." });
    return;
  }

  const allowedFields = ["firstName", "lastName", "email", "phoneNumbers", "isActive"];
  const invalidFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));

  if (invalidFields.length > 0) {
    res.status(400).json({ message: `Câmpuri necunoscute: ${invalidFields.join(", ")}` });
    return;
  }

  const { firstName, lastName, email, phoneNumbers, isActive } = req.body;
  if (email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({ message: "Formatul email-ului este invalid." });
      return;
    }
    client.email = email;
  }


  if (phoneNumbers !== undefined) {
    if (!Array.isArray(phoneNumbers) || !phoneNumbers.every(p => /^\d+$/.test(p))) {
      res.status(400).json({ message: "PhoneNumbers trebuie să fie un array de șiruri numerice." });
      return;
    }
    client.phoneNumbers = phoneNumbers;
  }

  if (firstName !== undefined) client.firstName = firstName;
  if (lastName !== undefined) client.lastName = lastName;
  if (isActive !== undefined) client.isActive = isActive;

  db.write();

  res.json({ message: "Clientul a fost actualizat cu succes.", client });
};

export const addCarToClient = (req: Request, res: Response): void => {
  db.read();
  const { id } = req.params;
  const client = db.data!.clients.find(c => c.id === id);

  if (!client) {
    res.status(404).json({ message: "Clientul nu a fost găsit pentru adăugarea mașinii." });
    return;
  }

  const { numberPlate, vin, brand, model, year, engineType, engineCapacity, horsepower, kilowatts } = req.body;

  if (!numberPlate || !vin || !brand || !model || !year || !engineType || !engineCapacity) {
    res.status(400).json({ message: "Datele mașinii sunt incomplete." });
    return;
  }
  const duplicatePlate = client.cars.find(car => car.numberPlate === numberPlate);
  if (duplicatePlate) {
    res.status(400).json({ message: "Clientul are deja o mașină cu acest număr de înmatriculare." });
    return;
  }

  const validEngineTypes = ["diesel", "petrol", "hybrid", "electric"];
  if (!validEngineTypes.includes(engineType)) {
    res.status(400).json({ message: `engineType trebuie să fie unul dintre: ${validEngineTypes.join(", ")}` });
    return;
  }

  let finalHorsepower = horsepower;
  let finalKilowatts = kilowatts;

  if (horsepower && !kilowatts) {
    finalKilowatts = Math.round(horsepower * 0.7355);
  } else if (!horsepower && kilowatts) {
    finalHorsepower = Math.round(kilowatts * 1.3596);
  } else if (!horsepower && !kilowatts) {
    res.status(400).json({ message: "Trebuie să furnizați fie horsepower, fie kilowatts." });
    return;
  }

  const newCar = {
    id: uuidv4(),
    numberPlate,
    vin,
    brand,
    model,
    year,
    engineType,
    engineCapacity,
    horsepower: finalHorsepower,
    kilowatts: finalKilowatts
  };

  client.cars.push(newCar);
  db.write();

  res.status(201).json({ message: "Mașina a fost adăugată cu succes.", car: newCar });
};

export const updateCarById = (req: Request, res: Response): void => {
  db.read();
  const { clientId, carId } = req.params;
  const client = db.data!.clients.find(c => c.id === clientId);

  if (!client) {
    res.status(404).json({ message: "Clientul nu a fost găsit pentru actualizare mașină." });
    return;
  }

  const car = client.cars.find(c => c.id === carId);

  if (!car) {
    res.status(404).json({ message: "Mașina nu a fost găsită pentru actualizare." });
    return;
  }

  const allowedFields = [
    "numberPlate", "vin", "brand", "model",
    "year", "engineType", "engineCapacity", "horsepower", "kilowatts"
  ];
  const invalidFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));

  if (invalidFields.length > 0) {
    res.status(400).json({ message: `Câmpuri necunoscute: ${invalidFields.join(", ")}` });
    return;
  }

  const { numberPlate, vin, brand, model, year, engineType, engineCapacity, horsepower, kilowatts } = req.body;

  if (numberPlate !== undefined) {
    const duplicatePlate = client.cars.find(c => c.numberPlate === numberPlate && c.id !== carId);
    if (duplicatePlate) {
      res.status(400).json({ message: "Altă mașină a clientului are deja acest număr de înmatriculare." });
      return;
    }
    car.numberPlate = numberPlate;
  }

  if (vin !== undefined) car.vin = vin;
  if (brand !== undefined) car.brand = brand;
  if (model !== undefined) car.model = model;
  if (year !== undefined) car.year = year;
  if (engineType !== undefined) car.engineType = engineType;
  if (engineCapacity !== undefined) car.engineCapacity = engineCapacity;

  if (horsepower !== undefined && kilowatts === undefined) {
    car.horsepower = horsepower;
    car.kilowatts = Math.round(horsepower * 0.7355);
  } else if (kilowatts !== undefined && horsepower === undefined) {
    car.kilowatts = kilowatts;
    car.horsepower = Math.round(kilowatts * 1.3596);
  } else if (horsepower !== undefined && kilowatts !== undefined) {
    car.horsepower = horsepower;
    car.kilowatts = kilowatts;
  }

  db.write();

  res.json({ message: "Mașina a fost actualizată cu succes.", car });
};


export const getCarsByClientId = (req: Request, res: Response): void => {
  db.read();
  const { clientId } = req.params;
  const client = db.data!.clients.find(c => c.id === clientId);

  if (!client) {
    res.status(404).json({ message: "Clientul nu a fost găsit." });
    return;
  }

  res.json(client.cars);
};

export const deleteCarById = (req: Request, res: Response): void => {
  db.read();
  const { clientId, carId } = req.params;
  const client = db.data!.clients.find(c => c.id === clientId);

  if (!client) {
    res.status(404).json({ message: "Clientul nu a fost găsit." });
    return;
  }

  const carIndex = client.cars.findIndex(car => car.id === carId);
  if (carIndex === -1) {
    res.status(404).json({ message: "Mașina nu a fost găsită pentru ștergere." });
    return;
  }

  client.cars.splice(carIndex, 1);
  db.write();

  res.json({ message: "Mașina a fost ștearsă cu succes." });
};
