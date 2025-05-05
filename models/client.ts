export interface Car {
    id: string;
    numberPlate: string;
    vin: string;
    brand: string;
    model: string;
    year: number;
    engineType: "diesel" | "petrol" | "hybrid" | "electric";
    engineCapacity: number;
    horsepower: number;
    kilowatts: number;
  }
  
  export interface Client {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumbers: string[];
    isActive: boolean;
    cars: Car[];
  }
  