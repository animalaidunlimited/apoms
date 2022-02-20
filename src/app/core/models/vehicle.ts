import { User } from "./user";

export interface Vehicle {
  vehicleId: number;
  vehicleType: string;
  vehicleNumber: string;
  vehicleStatus: string;
  vehicleTypeId: number;
  vehicleStatusId: number;
  registrationNumber: string;
  largeAnimalCapacity: number;
  smallAnimalCapacity: number;
  minRescuerCapacity: number;
  maxRescuerCapacity: number;
  currentVehicleStaff?: string;
  imageURL: string;
  vehicleColour: string;
  streetTreatVehicle: boolean | number;
  streetTreatDefaultVehicle: boolean | number;
}

export interface VehicleType {
  VehicleTypeId : number;
  VehicleType: string;
}

export interface VehicleStatus {
  VehicleStatusId: number;
  VehicleStatus: string;
}

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