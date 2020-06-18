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
                    animalType: 'Bird',
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

    getAreas() {
        if (!this.areas$) {
            this.areas$ = [
                { id: 1, areaName: 'Aayad' },
                { id: 2, areaName: 'Alipura' },
                { id: 3, areaName: 'Ambamata' },
                { id: 4, areaName: 'Ambavgarh' },
                { id: 5, areaName: 'Amberi' },
                { id: 6, areaName: 'Ashok Nagar' },
                { id: 7, areaName: 'Ashwini Bazar' },
                { id: 8, areaName: 'Awarimata' },
                { id: 9, areaName: 'Bada Bazar' },
                { id: 10, areaName: 'Bada Hawala' },
                { id: 11, areaName: 'Badgaon' },
                { id: 12, areaName: 'Badi' },
                { id: 13, areaName: 'Badi holi' },
                { id: 14, areaName: 'Balicha' },
                { id: 15, areaName: 'Bapu Bazar' },
                { id: 16, areaName: 'Bara Pal' },
                { id: 17, areaName: 'Bedla' },
                { id: 18, areaName: 'Bedwas' },
                { id: 19, areaName: 'Bhatt Ji Ki Badi' },
                { id: 20, areaName: 'Bhatyani chohtta' },
                { id: 21, areaName: 'Bhillo ka bedla' },
                { id: 22, areaName: 'Bhupalpura' },
                { id: 23, areaName: 'Bhuwana' },
                { id: 24, areaName: 'Bohra Ganesh Ji' },
                { id: 25, areaName: 'Brahmpole' },
                { id: 26, areaName: 'Boharwadi' },
                { id: 27, areaName: 'Bujra' },
                { id: 28, areaName: 'Bunjara' },
                { id: 29, areaName: 'Chandpole' },
                { id: 30, areaName: 'Chetak' },
                { id: 31, areaName: 'Chikalwas' },
                { id: 32, areaName: 'Chitrakut Nagar' },
                { id: 33, areaName: 'Court Choraya' },
                { id: 34, areaName: 'Dabok' },
                { id: 35, areaName: 'Dakon Kotda' },
                { id: 36, areaName: 'Dangiyo Ka Guda' },
                { id: 37, areaName: 'Debari' },
                { id: 38, areaName: 'Delhigate' },
                { id: 39, areaName: 'Delwada' },
                { id: 40, areaName: 'Detyamagri' },
                { id: 41, areaName: 'Dewali' },
                { id: 42, areaName: 'Dhanmandi' },
                { id: 43, areaName: 'Dhar' },
                { id: 44, areaName: 'Dholi magri' },
                { id: 45, areaName: 'Doodh Talai' },
                { id: 46, areaName: 'Durganursary' },
                { id: 47, areaName: 'Eklingpura' },
                { id: 48, areaName: 'Fatehpura' },
                { id: 49, areaName: 'Fatehsagar' },
                { id: 50, areaName: 'Gangour Ghat' },
                { id: 51, areaName: 'Ganesh ghati' },
                { id: 52, areaName: 'Gariyawas' },
                { id: 53, areaName: 'Ghantaghar' },
                { id: 54, areaName: 'Gorela' },
                { id: 55, areaName: 'Goverdhan Villas' },
                { id: 56, areaName: 'Govindpura' },
                { id: 57, areaName: 'Gulab Baag' },
                { id: 58, areaName: 'Haldi Ghati' },
                { id: 59, areaName: 'Hathipole' },
                { id: 60, areaName: 'Hawala' },
                { id: 61, areaName: 'Iswal' },
                { id: 62, areaName: 'Jagdish Chowk' },
                { id: 63, areaName: 'Jawahar nagar' },
                { id: 64, areaName: 'Jawar Mines' },
                { id: 65, areaName: 'Jini Ret' },
                { id: 66, areaName: 'Kailashpuri' },
                { id: 67, areaName: 'Kala Ji Gora Ji' },
                { id: 68, areaName: 'Kaladwas' },
                { id: 69, areaName: 'Kalarohi' },
                { id: 70, areaName: 'Kalka mata road' },
                { id: 71, areaName: 'Kankroli' },
                { id: 72, areaName: 'Kanpur Madri' },
                { id: 73, areaName: 'Kavita' },
                { id: 74, areaName: 'Keshav nagar' },
                { id: 75, areaName: 'Khanjipeer' },
                { id: 76, areaName: 'Khempura' },
                { id: 77, areaName: 'Kheradiwada' },
                { id: 78, areaName: 'Kishanpole' },
                { id: 79, areaName: 'Krishna Pura' },
                { id: 80, areaName: 'Kodiyat' },
                { id: 81, areaName: 'Kumharo Ka Bhatta' },
                { id: 82, areaName: 'Kundal' },
                { id: 83, areaName: 'Lakadwas' },
                { id: 84, areaName: 'Lakhawali' },
                { id: 85, areaName: 'Liyo Ka Guda' },
                { id: 86, areaName: 'Loyra' },
                { id: 87, areaName: 'Maaldas Street' },
                { id: 88, areaName: 'Machla Mangra' },
                { id: 89, areaName: 'Madhuban' },
                { id: 90, areaName: 'Madri' },
                { id: 91, areaName: 'Malla Talai' },
                { id: 92, areaName: 'Manvakheda' },
                { id: 93, areaName: 'Mavli' },
                { id: 94, areaName: 'Morwaniya' },
                { id: 95, areaName: 'Moti Mangri' },
                { id: 96, areaName: 'Motichouhata' },
                { id: 97, areaName: 'Mukherjee chowk' },
                { id: 98, areaName: 'Naai' },
                { id: 99, areaName: 'Nathdwara' },
                { id: 100, areaName: 'Nayion Ki Talai' },
                { id: 101, areaName: 'Neemuch Kheda' },
                { id: 102, areaName: 'Nela' },
                { id: 103, areaName: 'Nohra' },
                { id: 104, areaName: 'Outside Udaipur' },
                { id: 105, areaName: 'Paldi' },
                { id: 106, areaName: 'Panchwati' },
                { id: 107, areaName: 'Paneriyo Ki Madri' },
                { id: 108, areaName: 'Paras' },
                { id: 109, areaName: 'Patel Circle' },
                { id: 110, areaName: 'Pahada' },
                { id: 111, areaName: 'Picholi' },
                { id: 112, areaName: 'Polo Ground' },
                { id: 113, areaName: 'Pratap Nagar' },
                { id: 114, areaName: 'Pula' },
                { id: 115, areaName: 'Purohito Ki Madri' },
                { id: 116, areaName: 'Raghunathpura' },
                { id: 117, areaName: 'Rajsamand' },
                { id: 118, areaName: 'Rampura' },
                { id: 119, areaName: 'Rani Road' },
                { id: 120, areaName: 'Raoji Ka Hata' },
                { id: 121, areaName: 'Roopsagar' },
                { id: 122, areaName: 'Reti Stand' },
                { id: 123, areaName: 'Sabalpura' },
                { id: 124, areaName: 'Sahelinagar' },
                { id: 125, areaName: 'Saheliyo Ki Bari' },
                { id: 126, areaName: 'Sajjangarh' },
                { id: 127, areaName: 'Sajjan Nagar' },
                { id: 128, areaName: 'Sapetia' },
                { id: 129, areaName: 'Sardarpura' },
                { id: 130, areaName: 'Sarvritu Villlas' },
                { id: 131, areaName: 'Sastri Circle' },
                { id: 132, areaName: 'Savina' },
                { id: 133, areaName: 'Sector 1' },
                { id: 134, areaName: 'Sector 2' },
                { id: 135, areaName: 'Sector 3' },
                { id: 136, areaName: 'Sector 4' },
                { id: 137, areaName: 'Sector 5' },
                { id: 138, areaName: 'Sector 6' },
                { id: 139, areaName: 'Sector 7' },
                { id: 140, areaName: 'Sector 8' },
                { id: 141, areaName: 'Sector 9' },
                { id: 142, areaName: 'Sector 11' },
                { id: 143, areaName: 'Sector 12' },
                { id: 144, areaName: 'Sector 13' },
                { id: 145, areaName: 'Sector 14' },
                { id: 146, areaName: 'Shakti Nagar' },
                { id: 147, areaName: 'Shastri Circle' },
                { id: 148, areaName: 'Shobhagpura' },
                { id: 149, areaName: 'Sifan' },
                { id: 150, areaName: 'Sisarma' },
                { id: 151, areaName: 'Subhash Nagar' },
                { id: 152, areaName: 'Sukhadiya Circle' },
                { id: 153, areaName: 'Sukher' },
                { id: 154, areaName: 'Sunderwas' },
                { id: 155, areaName: 'Surajpole' },
                { id: 156, areaName: 'Sutharwada' },
                { id: 157, areaName: 'Swaroopsagar' },
                { id: 158, areaName: 'Sweaasharam' },
                { id: 159, areaName: 'Tekri' },
                { id: 160, areaName: 'Thokar' },
                { id: 161, areaName: 'Thoor' },
                { id: 162, areaName: 'Tiger Hills' },
                { id: 163, areaName: 'Titardi' },
                { id: 164, areaName: 'Town hall' },
                { id: 165, areaName: 'Udaiyapole' },
                { id: 166, areaName: 'Lalgath' },
                { id: 167, areaName: 'UIT Puliya' },
                { id: 168, areaName: 'Umarda' },
                { id: 169, areaName: 'University' },
                { id: 170, areaName: 'Varda' },
                { id: 171, areaName: 'Vallabhnagar' },
                { id: 172, areaName: 'Viliya' },
            ];
        }

        return this.areas$;
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
