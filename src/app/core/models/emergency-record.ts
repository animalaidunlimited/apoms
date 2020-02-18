    export interface EmergencyDetails {
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

    export interface Animal {
        position: number;
        speciesId: string;
        species: string;
        problems: Problem[];
        problemsString: string;
        tagNumber: string;
    }

    export interface ComplainerDetails {
        complainerName: string;
        complainerNumber: string;
        complainerAlternateNumber: string;
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
        animals: Animal[];
        complainerDetails: ComplainerDetails;
        callOutcome: CallOutcome;
        locationDetails: LocationDetails;
        rescueDetails: RescueDetails;
    }

    export interface EmergencyCase {
        emergencyForm: EmergencyForm;
    }
