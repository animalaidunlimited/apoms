import { VehicleStaff } from "./location";

export interface VehicleShift {
    vehicleShiftId: number;
    startTime: Date;
    endTime: Date;
    left?: number;
    length?: number;
    vehicleStaff: VehicleStaff[];
  }