import { LowSync } from "lowdb";
import { JSONFileSync } from "lowdb/node";
import { Client } from "./models/client";
import { Appointment } from "./models/appointment";

type Data = {
  clients: Client[];
  appointments: Appointment[];
};

const adapter = new JSONFileSync<Data>("data/db.json");
export const db = new LowSync(adapter, { clients: [], appointments: [] });
db.read();
