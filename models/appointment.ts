export type ContactMethod = "email" | "phone" | "inPerson";

export interface Appointment {
  id: string;
  clientId: string;
  carId: string;
  contactMethod: ContactMethod;
  action: string;
  date: string; 
  time:string; 
  duration: number;

  receptionNotes?: string;
  processingNotes?: string;
  repairDuration?: number; 
}
