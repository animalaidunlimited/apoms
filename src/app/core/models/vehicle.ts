import { UUID } from "angular2-uuid";
import { User } from "./user";


export interface VehicleShift {
    shiftUUID: string;
    vehicleShiftId: number;
    vehicleId: number;
    shiftStartTime: Date;
    shiftEndTime: Date;
    left?: number;
    length?: number;
    vehicleStaff: User[];
  }

  export interface VehicleDetails {
    vehicleId: number;
    vehicleTypeId: number;
    vehicleImage: string;
    vehicleNumber: string;
    largeAnimalCapacity: number;
    smallAnimalCapacity: number;
    vehicleRegistrationNumber: string;
}