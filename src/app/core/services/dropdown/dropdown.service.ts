import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AnimalType } from '../../models/animal-type';
import { map } from 'rxjs/operators';
import { CallOutcomeResponse } from '../../models/call-outcome';
import { EmergencyCode } from '../../models/emergency-code';
import {
    ProblemDropdownResponse,
    PatientStatus,
    CallType,
    PatientCallOutcome,
} from '../../models/responses';
import { APIService } from '../http/api.service';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user';
import {
    Surgeon,
    SurgerySite,
    SurgeryType,
} from '../../models/Surgery-details';
import { CensusArea } from '../../models/census-details';
import { ConditionalExpr } from '@angular/compiler';

export interface AnimalTypeResponse {
    data: AnimalType[];
}

@Injectable({
    providedIn: 'root',
})
export class DropdownService extends APIService {
    endpoint = 'Dropdown';

    rescuers$: Observable<User[]>;
    emergencyCodes$: Observable<EmergencyCode[]>;
    areas$: any[];
    dispatchers$: Observable<User[]>;
    callOutcomes$: Observable<CallOutcomeResponse[]>;
    crueltyIspectors$: Observable<User[]>;
    antibiotics$;
    isoReasons$;
    animalTypes$: Observable<AnimalType[]>;
    problems$: Observable<ProblemDropdownResponse[]>;
    exclusions$;
    officeStaff$: Observable<User[]>;
    callStaff$: Observable<User[]>;
    patientStates$: Observable<PatientStatus[]>;
    callTypes$: Observable<CallType[]>;
    patientCallOutcome$: Observable<PatientCallOutcome[]>;
    surgeons$: Observable<User[]>;
    surgerySites$: Observable<SurgerySite[]>;
    surgeryTypes$: Observable<SurgeryType[]>;
    censusAreas$ : Observable<CensusArea[]>;

    constructor(http: HttpClient) {
        super(http);
    }

    getOfficeStaff(): Observable<User[]> {
        const request = '/OfficeStaff';

        if (!this.officeStaff$) {
            this.officeStaff$ = this.getObservable(request).pipe(
                map(response => {
                    return response;
                }),
            );
        }

        return this.officeStaff$;
    }

    getCallStaff(): Observable<User[]> {
        const request = '/CallStaff';

        if (!this.callStaff$) {
            this.callStaff$ = this.getObservable(request).pipe(
                map(response => {
                    return response;
                }),
            );
        }

        return this.callStaff$;
    }

    getExclusions() {
        if (!this.exclusions$) {
            this.exclusions$ = [
                {
                    animalType: 'Bird (other)',
                    exclusionList: [
                        'Horn/hoof problem',
                        'Normal behaviour - biting',
                        'Penis coming out',
                        'Pregnancy problem',
                        'Shifted puppies',
                    ],
                },
                {
                    animalType: 'Buffalo',
                    exclusionList: ['Can\'t fly', 'Shifted puppies'],
                },
                {
                    animalType: 'Buffalo Calf',
                    exclusionList: ['Can\'t fly', 'Shifted puppies'],
                },
                {
                    animalType: 'Bull',
                    exclusionList: ['Can\'t fly', 'Shifted puppies'],
                },
                {
                    animalType: 'Calf',
                    exclusionList: [
                        'Can\'t fly',
                        'Shifted puppies',
                        'Pregnancy problem',
                    ],
                },
                {
                    animalType: 'Camel',
                    exclusionList: [
                        'Horn/hoof problem',
                        'Can\'t fly',
                        'Shifted puppies',
                    ],
                },
                {
                    animalType: 'Cat',
                    exclusionList: [
                        'Horn/hoof problem',
                        'Can\'t fly',
                        'Shifted puppies',
                    ],
                },
                {
                    animalType: 'Chicken',
                    exclusionList: [
                        'Horn/hoof problem',
                        'Normal behaviour - biting',
                        'Penis coming out',
                        'Pregnancy problem',
                        'Shifted puppies',
                    ],
                },
                {
                    animalType: 'Cow',
                    exclusionList: ['Can\'t fly', 'Shifted puppies'],
                },
                {
                    animalType: 'Dog',
                    exclusionList: ['Horn/hoof problem', 'Can\'t fly'],
                },
                {
                    animalType: 'Donkey',
                    exclusionList: ['Can\'t fly', 'Shifted puppies'],
                },
                {
                    animalType: 'Egret',
                    exclusionList: [
                        'Horn/hoof problem',
                        'Normal behaviour - biting',
                        'Penis coming out',
                        'Pregnancy problem',
                        'Shifted puppies',
                    ],
                },
                {
                    animalType: 'Fox',
                    exclusionList: [
                        'Horn/hoof problem',
                        'Can\'t fly',
                        'Shifted puppies',
                    ],
                },
                {
                    animalType: 'Goat',
                    exclusionList: ['Can\'t fly', 'Shifted puppies'],
                },
                {
                    animalType: 'Horse',
                    exclusionList: ['Can\'t fly', 'Shifted puppies'],
                },
                {
                    animalType: 'Kitten',
                    exclusionList: [
                        'Horn/hoof problem',
                        'Can\'t fly',
                        'Shifted puppies',
                    ],
                },
                {
                    animalType: 'Monkey',
                    exclusionList: [
                        'Horn/hoof problem',
                        'Can\'t fly',
                        'Shifted puppies',
                    ],
                },
                {
                    animalType: 'Nevala',
                    exclusionList: [
                        'Horn/hoof problem',
                        'Can\'t fly',
                        'Shifted puppies',
                    ],
                },
                {
                    animalType: 'Parrot',
                    exclusionList: [
                        'Horn/hoof problem',
                        'Normal behaviour - biting',
                        'Penis coming out',
                        'Pregnancy problem',
                        'Shifted puppies',
                    ],
                },
                {
                    animalType: 'Pig',
                    exclusionList: ['Can\'t fly', 'Shifted puppies'],
                },
                {
                    animalType: 'Pigeon',
                    exclusionList: [
                        'Horn/hoof problem',
                        'Normal behaviour - biting',
                        'Penis coming out',
                        'Pregnancy problem',
                        'Shifted puppies',
                    ],
                },
                {
                    animalType: 'Puppy',
                    exclusionList: ['Horn/hoof problem', 'Can\'t fly'],
                },
                {
                    animalType: 'Rabbit',
                    exclusionList: [
                        'Horn/hoof problem',
                        'Can\'t fly',
                        'Shifted puppies',
                    ],
                },
                {
                    animalType: 'Sheep',
                    exclusionList: ['Can\'t fly', 'Shifted puppies'],
                },
                {
                    animalType: 'Sparrow',
                    exclusionList: [
                        'Horn/hoof problem',
                        'Normal behaviour - biting',
                        'Penis coming out',
                        'Pregnancy problem',
                        'Shifted puppies',
                    ],
                },
                {
                    animalType: 'Squirrel',
                    exclusionList: [
                        'Horn/hoof problem',
                        'Can\'t fly',
                        'Shifted puppies',
                    ],
                },
                {
                    animalType: 'Tortoise',
                    exclusionList: [
                        'Horn/hoof problem',
                        'Can\'t fly',
                        'Shifted puppies',
                    ],
                },
            ];
        }

        return this.exclusions$;
    }

    // Here we get the response and map it to our observable array and then use
    // share replay for caching to avoid hitting the API every time we want to add
    // a new case
    getAnimalTypes(): Observable<AnimalType[]> {
        const request = '/AnimalTypes';

        if (!this.animalTypes$) {
            this.animalTypes$ = this.getObservable(request).pipe(
                map(response => {
                    return response;
                }),
            );
        }
        return this.animalTypes$;
    }

    getProblems(): Observable<ProblemDropdownResponse[]> {
        const request = '/Problems';

        if (!this.problems$) {
            this.problems$ = this.getObservable(request).pipe(
                map((response: ProblemDropdownResponse[]) => {
                    return response;
                }),
            );
        }

        return this.problems$;
    }

    getIsoReasons() {
        if (!this.isoReasons$) {
            this.isoReasons$ = [
                { id: 1, isoReason: 'Breathing Problem' },
                { id: 2, isoReason: 'Nasal Discharge' },
                { id: 3, isoReason: 'Eye Discharge' },
                { id: 4, isoReason: 'Coughing' },
                { id: 5, isoReason: 'Diarrhea' },
                { id: 6, isoReason: 'Circling' },
                { id: 7, isoReason: 'Twitching' },
                { id: 8, isoReason: 'Nuerological' },
                { id: 9, isoReason: 'Rabies Suspected' },
            ];
        }

        return this.isoReasons$;
    }

    getAntibiotics() {
        if (!this.antibiotics$) {
            this.antibiotics$ = [
                { id: 1, antibiotic: 'Amoxicillin' },
                { id: 2, antibiotic: 'Azithromycin' },
                { id: 3, antibiotic: 'Bactoclav' },
                { id: 4, antibiotic: 'Biotrim' },
                { id: 5, antibiotic: 'Bovicef' },
                { id: 6, antibiotic: 'Cefpet' },
                { id: 7, antibiotic: 'Clindamycin' },
                { id: 8, antibiotic: 'Doxycycline' },
                { id: 9, antibiotic: 'Enrofloxacin' },
                { id: 10, antibiotic: 'Intacef' },
                { id: 11, antibiotic: 'Meloxicam' },
                { id: 12, antibiotic: 'Metrogyl' },
                { id: 13, antibiotic: 'Metronidazole' },
                { id: 14, antibiotic: 'Metroxyl' },
                { id: 15, antibiotic: 'Penicillin' },
                { id: 16, antibiotic: 'Septran' },
                { id: 17, antibiotic: 'Tramadol' },
                { id: 18, antibiotic: 'Tribivet' },
            ];
        }

        return this.antibiotics$;
    }

    getCrueltyInspectors(): Observable<User[]> {
        const request = '/CrueltyStaff';

        if (!this.crueltyIspectors$) {
            this.crueltyIspectors$ = this.getObservable(request).pipe(
                map((response: User[]) => {
                    return response;
                }),
            );
        }

        return this.crueltyIspectors$;
    }

    getDispatchers(): Observable<User[]> {
        const request = '/Dispatchers';

        if (!this.dispatchers$) {
            this.dispatchers$ = this.getObservable(request).pipe(
                map((response: User[]) => {
                    return response;
                }),
            );
        }

        return this.dispatchers$;
    }

    getCallOutcomes(): Observable<CallOutcomeResponse[]> {
        const request = '/CallOutcomes';

        if (!this.callOutcomes$) {
            this.callOutcomes$ = this.getObservable(request).pipe(
                map((response: CallOutcomeResponse[]) => {
                    return response;
                }),
            );
        }
        return this.callOutcomes$;
    }

    getRescuers(): Observable<User[]> {
        const request = '/Rescuers';

        if (!this.rescuers$) {
            this.rescuers$ = this.getObservable(request).pipe(
                map((response: User[]) => {
                    return response;
                }),
            );
        }

        return this.rescuers$;
    }

    getEmergencyCodes(): Observable<EmergencyCode[]> {
        const request = '/EmergencyCodes';

        if (!this.emergencyCodes$) {
            this.emergencyCodes$ = this.getObservable(request).pipe(
                map((response: EmergencyCode[]) => {
                    return response;
                }),
            );
        }

        return this.emergencyCodes$;
    }

    getPatientStates(): Observable<PatientStatus[]> {
        const request = '/PatientStates';

        if (!this.patientStates$) {
            this.patientStates$ = this.getObservable(request).pipe(
                map((response: PatientStatus[]) => {
                    return response;
                }),
            );
        }

        return this.patientStates$;
    }

    getCallTypes(): Observable<CallType[]> {
        const request = '/CallTypes';

        if (!this.callTypes$) {
            this.callTypes$ = this.getObservable(request).pipe(
                map((response: CallType[]) => {
                    return response;
                }),
            );
        }

        return this.callTypes$;
    }

    getSurgeon(): Observable<User[]> {
        const request = '/Surgeon';

        if (!this.surgeons$) {
            this.surgeons$ = this.getObservable(request).pipe(
                map((response: User[]) => {
                    return response;
                }),
            );
        }

        return this.surgeons$;
    }

    getSurgerySite(): Observable<SurgerySite[]> {
        const request = '/SurgerySite';

        if (!this.surgerySites$) {
            this.surgerySites$ = this.getObservable(request).pipe(
                map((response: SurgerySite[]) => {
                    return response;
                }),
            );
        }

        return this.surgerySites$;
    }

    getSurgeryType(): Observable<SurgeryType[]> {
        const request = '/SurgeryType';

        if (!this.surgeryTypes$) {
            this.surgeryTypes$ = this.getObservable(request).pipe(
                map((response: SurgeryType[]) => {
                    return response;
                }),
            );
        }

        return this.surgeryTypes$;
    }

    getPatientCallOutcomes(): Observable<PatientCallOutcome[]> {
        const request = '/PatientCallOutcomes';

        if (!this.patientCallOutcome$) {
            this.patientCallOutcome$ = this.getObservable(request).pipe(
                map((response: PatientCallOutcome[]) => {
                    return response;
                }),
            );
        }

        return this.patientCallOutcome$;
    }

}
