import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { AnimalType } from '../../models/animal-type';
import { map } from 'rxjs/operators';
import { CallOutcomeResponse } from '../../models/call-outcome';
import { EmergencyCode } from '../../models/emergency-code';
import {
    ProblemDropdownResponse,
    CallType,
    PatientCallerInteractionOutcome,
    Exclusions,
    PatientStatusResponse,
    StreetTreatMainProblem
} from '../../models/responses';
import { APIService } from '../http/api.service';
import { HttpClient } from '@angular/common/http';
import { User, ReleaseManager } from '../../models/user';
import { PaperDimensions, PrintElement } from '../../models/print-templates';
import { Antibiotic } from '../../models/patients';
import { UserJobType } from '../../models/user';
import { TeamDetails } from '../../models/team';
import { SurgerySite, SurgeryType } from '../../models/surgery-details';
import { Status } from '../../models/status';
import { VisitType } from '../../models/visit-type';
import { Priority } from '../../models/priority';
import { KeyValuePair } from '../../models/generic';
import { TreatmentArea } from '../../models/treatment-lists';
import { VehicleType, Vehicle } from '../../models/driver-view';





export interface AnimalTypeResponse {
    data: AnimalType[];
}

@Injectable({
    providedIn: 'root',
})
export class DropdownService extends APIService {
    endpoint = 'Dropdown';


    animalTypes$!: Observable<AnimalType[]>;
    antibiotics$!: any[];
    areas$!: any[];
    callOutcomes$!: Observable<CallOutcomeResponse[]>;
    callStaff$!: Observable<User[]>;
    callTypes$!: Observable<CallType[]>;
    crueltyIspectors$!: Observable<User[]>;
    dispatchers$!: Observable<User[]>;
    emergencyCodes$!: Observable<EmergencyCode[]>;
    exclusions$!: Exclusions[];
    eyeDischarge$!: any[];
    isoReasons$!: any[];
    nasalDischarge$!: any[];
    officeStaff$!: Observable<User[]>;
    paperDimensions$!: Observable<PaperDimensions[]>;
    patientCallOutcome$!: Observable<PatientCallerInteractionOutcome[]>;
    patientStates$!: Observable<PatientStatusResponse[]>;
    printableElements$!: Observable<PrintElement[]>;
    problems$!: Observable<ProblemDropdownResponse[]>;
    rescuers$!: Observable<User[]>;
    surgeons$!: Observable<User[]>;
    surgerySites$!: Observable<SurgerySite[]>;
    surgeryTypes$!: Observable<SurgeryType[]>;
    jobTypes$!: Observable<UserJobType[]>;
	team$!: Observable<TeamDetails[]>;
	status$!:Observable<Status[]>;
	visitTypes$!:Observable<VisitType[]>;
	priority$!:Observable<Priority[]>;
    releaseManagers$!: Observable<ReleaseManager[]>;
    streetTreatMainProblem$!: Observable<StreetTreatMainProblem[]>;
    treatmentAreas$!:Observable<TreatmentArea[]>;
    yesNo$!:any[];
    vehicleTypes$!: Observable<VehicleType[]>;
    vehicleList$!: Observable<Vehicle[]>




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
                    return response.sort((a: AnimalType,b: AnimalType) => a.Sort- b.Sort);
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
                { id: 8, isoReason: 'Neurological' },
                { id: 9, isoReason: 'Rabies Suspected' },
            ];
        }

        return this.isoReasons$;
    }

    getEyeDischarge() {
        if (!this.eyeDischarge$) {
            this.eyeDischarge$ = [
                {key: 1, value: 'Nil'},
                {key: 2, value: 'ED'},
                {key: 3, value: 'ED⊕'},
                {key: 4, value: 'ED⊕⊕'}
            ];
        }

        return this.eyeDischarge$;
    }

    getYesNo() : Observable<KeyValuePair[]> {

        const yesNo:KeyValuePair[] = [
            {key: '1', value: 'Yes'},
            {key: '2', value: 'No'}
        ];

        return of(yesNo);
    }

    getNasalDischarge() {
        if (!this.nasalDischarge$) {
            this.nasalDischarge$ = [
                {key: 1, value: 'Nil'},
                {key: 2, value: 'ND'},
                {key: 3, value: 'ND⊕'},
                {key: 4, value: 'ND⊕⊕'}
            ];
        }

        return this.nasalDischarge$;
    }

    getAntibiotics() : Antibiotic[] {
        if (!this.antibiotics$) {
            this.antibiotics$ = [
                { antibioticId: 1, antibiotic: 'Amoxicillin' },
                { antibioticId: 2, antibiotic: 'Azithromycin' },
                { antibioticId: 3, antibiotic: 'Bactoclav' },
                { antibioticId: 4, antibiotic: 'Biotrim' },
                { antibioticId: 5, antibiotic: 'Bovicef' },
                { antibioticId: 6, antibiotic: 'Cefpet' },
                { antibioticId: 7, antibiotic: 'Clindamycin' },
                { antibioticId: 8, antibiotic: 'Doxycycline' },
                { antibioticId: 9, antibiotic: 'Enrofloxacin' },
                { antibioticId: 10, antibiotic: 'Intacef' },
                { antibioticId: 11, antibiotic: 'Meloxicam' },
                { antibioticId: 12, antibiotic: 'Metrogyl' },
                { antibioticId: 13, antibiotic: 'Metronidazole' },
                { antibioticId: 14, antibiotic: 'Metroxyl' },
                { antibioticId: 15, antibiotic: 'Penicillin' },
                { antibioticId: 16, antibiotic: 'Septran' },
                { antibioticId: 17, antibiotic: 'Tramadol' },
                { antibioticId: 18, antibiotic: 'Tribivet' }
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
                    return response.sort((a,b) => a.SortOrder - b.SortOrder);
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

    getPatientStates(): Observable<PatientStatusResponse[]> {
        const request = '/PatientStates';

        if (!this.patientStates$) {
            this.patientStates$ = this.getObservable(request).pipe(
                map((response: PatientStatusResponse[]) => {
                    return response.filter(status => status.PatientStatus !=='StreetTreat');
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

    getPatientCallerInteractionOutcomes(): Observable<PatientCallerInteractionOutcome[]> {
        const request = '/PatientCallerInteractionOutcomes';

        if (!this.patientCallOutcome$) {
            this.patientCallOutcome$ = this.getObservable(request).pipe(
                map((response: PatientCallerInteractionOutcome[]) => {
                    return response;
                }),
            );
        }

        return this.patientCallOutcome$;
    }

    getPrintableElements(): Observable<PrintElement[]> {
        const request = '/PrintableElements';

        if (!this.printableElements$) {
            this.printableElements$ = this.getObservable(request).pipe(
                map((response: PrintElement[]) => {
                    return response;
                }),
            );
        }

        return this.printableElements$;
    }

    getPaperDimensions(): Observable<PaperDimensions[]> {
        const request = '/PaperDimensions';

        if (!this.paperDimensions$) {
            this.paperDimensions$ = this.getObservable(request).pipe(
                map((response: PaperDimensions[]) => {
                    return response;
                }),
            );
        }

        return this.paperDimensions$;
    }

    getAllTeams(): Observable<TeamDetails[]>{
        const request = '/GetAllTeams';

        if(!this.team$) {
          this.team$ = this.getObservable(request).pipe(
            map(response=>{
              return response;
            })
          );
        }
        return this.team$;
      }


  getUserJobType(): Observable<UserJobType[]> {
    const request = '/GetJobTypes';

    if(!this.jobTypes$) {
      this.jobTypes$ = this.getObservable(request).pipe(
        map(response=>{
          return response;
        })
      );
    }
    return this.jobTypes$;
  }

  getStatus(): Observable<Status[]>{
	const request = '/GetStatus';

	if(!this.status$) {
	  this.status$ = this.getObservable(request).pipe(
		map(response=>{
		  return response.data;
		})
	  );
	}
	return this.status$;
  }
  getVisitType(): Observable<VisitType[]>{
	  const request = '/GetVisitType';
	  if(!this.visitTypes$){
		this.visitTypes$ = this.getObservable(request).pipe(
			map(response => {
				return response.data;
			})
		);
	  }
	  return this.visitTypes$;
  }

  getPriority(): Observable<Priority[]>{
	  const request = '/GetPriority';
	  if(!this.priority$){
		  this.priority$ = this.getObservable(request).pipe(
			  map(response=> {
				  return response;
			  })
		  );
	  }
	  return this.priority$;
    }

  getReleaseManagers(): Observable<ReleaseManager[]> {
    const request = '/GetReleaseManagers';

    if(!this.releaseManagers$) {
        this.releaseManagers$ = this.getObservable(request).pipe(
            map((response: ReleaseManager[])=>{
                return response;
            })
        );
    }

    return this.releaseManagers$;


    }

    getStreetTreatMainProblems(): Observable<StreetTreatMainProblem[]> {
      const request = '/GetStreetTreatMainProblem';

      if(!this.streetTreatMainProblem$) {
        this.streetTreatMainProblem$ = this.getObservable(request).pipe(
            map((response: StreetTreatMainProblem[])=>{
                return response;
            })
        );
    }

    return this.streetTreatMainProblem$;

  }

  getTreatmentAreas(): Observable<TreatmentArea[]> {
    const request = '/GetTreatmentAreas';

    if(!this.treatmentAreas$) {
      this.treatmentAreas$ = this.getObservable(request).pipe(
          map((response: TreatmentArea[])=> {
              return response;
          })
      );
  }

  return this.treatmentAreas$;

}

getVehicleType(): Observable<VehicleType[]> {

    const request = '/GetVehicleTypes';

    if(!this.vehicleTypes$) {
        this.vehicleTypes$ = this.getObservable(request).pipe(
            map((response: VehicleType[])=>{
                return response;
            })
        );
    }

return this.vehicleTypes$;

}

getVehicleListDropdown(): Observable<Vehicle[]> {

    const request = '/GetVehicleList';

    if(!this.vehicleList$) {
        this.vehicleList$ = this.getObservable(request).pipe(
            map((response: Vehicle[])=>{
                return response;
            })
        );
    }

return this.vehicleList$;

}


}
