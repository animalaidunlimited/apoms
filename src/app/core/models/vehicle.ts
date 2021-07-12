import { User } from "./user";


export interface VehicleShift {
    vehicleShiftId: number;
    vehicleId: number;
    startTime: Date;
    endTime: Date;
    shiftStartTimeString?: string;
    shiftEndTimeString?: string;
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