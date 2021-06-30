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
}

export interface VehicleType {
    VehicleTypeId : number;
    VehicleType: string;
  }

  export interface VehicleStatus {
    VehicleStatusId: number;
    VehicleStatus: string;
  }