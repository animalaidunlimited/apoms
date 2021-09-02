import { User } from "./user";


export interface VehicleShift {
    shiftUUID: string;
    vehicleShiftId: number;
    vehicleId: number;
    shiftStartTime: string;
    shiftEndTime: string;
    shiftStartTimeDate: Date;
    shiftEndTimeDate: Date;
    left?: number;
    length?: number;
    isDeleted: boolean;
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

export interface HourRange {
  start: number;
  end: number;
  range: number[];
}