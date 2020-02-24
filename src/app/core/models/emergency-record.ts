    export interface EmergencyDetails {
        emergencyCaseId: number;
        emergencyNumber: string;
        callDateTime: string;
        dispatcher: number;
        code: number;
    }

    export interface Problem {
        id: number;
        problem: string;
        problemStripped: string;
        }

    export interface Patient {
        patientId: number;
        position: number;
        animalTypeId: string;
        animalType: string;
        problems: Problem[];
        problemsString: string;
        tagNumber: string;
    }

    export interface CallerDetails {
        CallerId: number;
        CallerName: string;
        CallerNumber: string;
        CallerAlternateNumber: string;
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
