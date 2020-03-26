    export interface EmergencyDetails {
        emergencyCaseId: number;
        emergencyNumber: string;
        callDateTime: string;
        dispatcher: number;
        code: number;
    }

    export interface Problem {
        problemId: number;
        problem: string;
        }

    export interface Patient {
        patientId: number;
        position: number;
        animalTypeId: string;
        animalType: string;
        problems: Problem[];
        problemsString: string;
        tagNumber: string;
        duplicateTag: boolean;
        updated: boolean;
        deleted: boolean;
    }

    export interface CallerDetails {
        callerId: number;
        callerName: string;
        callerNumber: string;
        callerAlternativeNumber: string;
    }

    export interface CallOutcome {
        callOutcome: number;
    }

    export interface LocationDetails {
        animalLocation: string;
        latitude: number;
        longitude: number;
    }

    export interface RescueDetails {
        rescuer1: string;
        rescuer2: string;
        ambulanceArrivalTime: string;
        rescueTime: string;
        admissionTime: string;
    }

    export interface EmergencyForm {
        emergencyDetails: EmergencyDetails;
        patients: Patient[];
        callerDetails: CallerDetails;
        callOutcome: CallOutcome;
        locationDetails: LocationDetails;
        rescueDetails: RescueDetails;
    }

    export interface EmergencyCase {
        emergencyForm: EmergencyForm;
    }
