import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AnimalType } from '../../models/animal-type';
import { map } from 'rxjs/operators';
import { Dispatcher } from '../../models/dispatcher';
import { CallOutcomeResponse } from '../../models/call-outcome';
import { Rescuer } from '../../models/rescuer';
import { EmergencyCode } from '../../models/emergency-code';
import { ProblemDropdownResponse, PatientStatus, CallType, PatientCallOutcome } from '../../models/responses';
import { APIService } from '../http/api.service';
import { HttpClient } from '@angular/common/http';
import { User } from '../../models/user';


export interface AnimalTypeResponse {
  data: AnimalType[];
}


@Injectable({
  providedIn: 'root'
})
export class DropdownService extends APIService{

  endpoint:string = "Dropdown";

  rescuers$:Observable<User[]>;
  emergencyCodes$:Observable<EmergencyCode[]>;
  areas$:any[];
  dispatchers$:Observable<User[]>;
  callOutcomes$:Observable<CallOutcomeResponse[]>;
  crueltyIspectors$:Observable<User[]>;
  antibiotics$;
  isoReasons$;
  animalTypes$:Observable<AnimalType[]>;
  problems$:Observable<ProblemDropdownResponse[]>;
  exclusions$;
  officeStaff$:Observable<User[]>;
  callStaff$:Observable<User[]>
  patientStates$:Observable<PatientStatus[]>;
  callTypes$:Observable<CallType[]>;
  patientCallOutcome$:Observable<PatientCallOutcome[]>;


  constructor(http: HttpClient) {
    super(http)
   }

  getOfficeStaff(): Observable<User[]> {

    let request = "/OfficeStaff";

    if (!this.officeStaff$)
    {
      this.officeStaff$ = this.getObservable(request)
      .pipe(
        map((response) => {
          return response;
        })
      );
    }

    return this.officeStaff$;
  }

  getCallStaff(): Observable<User[]> {

    let request = "/CallStaff";

    if (!this.callStaff$)
    {
      this.callStaff$ = this.getObservable(request)
      .pipe(
        map((response) => {
          return response;
        })
      );
    }

    return this.callStaff$;
  }

  getExclusions() {
    if (!this.exclusions$)
    {
      this.exclusions$ = [
        {"animalType":"Bird","exclusionList":
          ["Horn/hoof problem","Normal behaviour - biting","Penis coming out",
          "Pregnancy problem","Shifted puppies"]},
        {"animalType":"Buffalo","exclusionList":
          ["Can't fly","Shifted puppies"]},
        {"animalType":"Buffalo Calf","exclusionList":["Can't fly","Shifted puppies"]},
        {"animalType":"Bull","exclusionList":["Can't fly","Shifted puppies"]},
        {"animalType":"Calf","exclusionList":["Can't fly","Shifted puppies","Pregnancy problem"]},
        {"animalType":"Camel","exclusionList":["Horn/hoof problem","Can't fly","Shifted puppies"]},
        {"animalType":"Cat","exclusionList":["Horn/hoof problem","Can't fly","Shifted puppies"]},
        {"animalType":"Chicken","exclusionList":["Horn/hoof problem","Normal behaviour - biting","Penis coming out","Pregnancy problem","Shifted puppies"]},
        {"animalType":"Cow","exclusionList":["Can't fly","Shifted puppies"]},
        {"animalType":"Dog","exclusionList":["Horn/hoof problem","Can't fly"]},
        {"animalType":"Donkey","exclusionList":["Can't fly","Shifted puppies"]},
        {"animalType":"Fox","exclusionList":["Horn/hoof problem","Can't fly","Shifted puppies"]},
        {"animalType":"Goat","exclusionList":["Can't fly","Shifted puppies"]},
        {"animalType":"Horse","exclusionList":["Can't fly","Shifted puppies"]},
        {"animalType":"Kitten","exclusionList":["Horn/hoof problem","Can't fly","Shifted puppies"]},
        {"animalType":"Parrot","exclusionList":["Horn/hoof problem","Normal behaviour - biting","Penis coming out","Pregnancy problem","Shifted puppies"]},
        {"animalType":"Pig","exclusionList":["Can't fly","Shifted puppies"]},
        {"animalType":"Pigeon","exclusionList":["Horn/hoof problem","Normal behaviour - biting","Penis coming out","Pregnancy problem","Shifted puppies"]},
        {"animalType":"Puppy","exclusionList":["Horn/hoof problem","Can't fly"]},
        {"animalType":"Sheep","exclusionList":["Can't fly","Shifted puppies"]},
        {"animalType":"Sparrow","exclusionList":["Horn/hoof problem","Normal behaviour - biting","Penis coming out","Pregnancy problem","Shifted puppies"]},
        {"animalType":"Squirrel","exclusionList":["Horn/hoof problem","Can't fly","Shifted puppies"]},
        {"animalType":"Tortoise","exclusionList":["Horn/hoof problem","Can't fly","Shifted puppies"]}];
    }

    return this.exclusions$;
  }

  //Here we get the response and map it to our observable array and then use
  //share replay for caching to avoid hitting the API every time we want to add
  //a new case
  getAnimalTypes(): Observable<AnimalType[]> {

    let request = "/AnimalTypes";

    if (!this.animalTypes$)
    {
      this.animalTypes$ = this.getObservable(request)
      .pipe(
        map((response) => {
          return response;
        })
      );
    }

          // this.animalTypes$ = this.http
      // .get<AnimalType[]>("/Dropdown/AnimalTypes").pipe(
      //   map( (res) => {return res})//,
      //   //shareReplay(1,10000)
      // )

    return this.animalTypes$;

  }

  // getAnimalTypes() {
  //   if (!this.animalTypes$)
  //   {
  //     this.animalTypes$ = [{"AnimalTypeId": 1,"AnimalType": "Dog"},	{"AnimalTypeId": 2,"AnimalType": "Puppy"},	{"AnimalTypeId": 3,"AnimalType": "Cow"},	{"AnimalTypeId": 4,"AnimalType": "Bull"},	{"AnimalTypeId": 5,"AnimalType": "Calf"},	{"AnimalTypeId": 6,"AnimalType": "Donkey"},	{"AnimalTypeId": 7,"AnimalType": "Cat"},	{"AnimalTypeId": 8,"AnimalType": "Bird"},	{"AnimalTypeId": 9,"AnimalType": "Goat"},	{"AnimalTypeId": 10,"AnimalType": "Pig"},	{"AnimalTypeId": 11,"AnimalType": "Kitten"},	{"AnimalTypeId": 12,"AnimalType": "Sheep"},	{"AnimalTypeId": 13,"AnimalType": "Buffalo"},	{"AnimalTypeId": 14,"AnimalType": "Parrot"},	{"AnimalTypeId": 15,"AnimalType": "Squirrel"},	{"AnimalTypeId": 16,"AnimalType": "Fox"},	{"AnimalTypeId": 17,"AnimalType": "Camel"},	{"AnimalTypeId": 18,"AnimalType": "Pigeon"},	{"AnimalTypeId": 19,"AnimalType": "Sparrow"},{"AnimalTypeId": 20,"AnimalType": "Horse"},{"AnimalTypeId": 21,"AnimalType": "Tortoise"},{"AnimalTypeId": 22,"AnimalType": "Chicken"}];
  //  }

  //   return this.animalTypes$;
  // }

  // getProblems() {
  //   if (!this.problems$)
  //   {
  //     this.problems$ =[{"ProblemId":1, "Problem": "Abnormal Behaviour","ProblemStripped": "AbnormalBehaviour"},{"ProblemId":2, "Problem": "Abnormal Walking", "ProblemStripped": "AbnormalWalking"},{"ProblemId":3, "Problem": "Abnormal Behaviour Biting", "ProblemStripped": "AbnormalBehaviourBiting"},{"ProblemId":4, "Problem": "Anorexia", "ProblemStripped": "Anorexia"},{"ProblemId":5, "Problem": "Blind", "ProblemStripped": "Blind"},{"ProblemId":6, "Problem": "Can't fly", "ProblemStripped": "Cantfly"},{"ProblemId":7, "Problem": "Circling", "ProblemStripped": "Circling"},{"ProblemId":8, "Problem": "Cruelty", "ProblemStripped": "Cruelty"},{"ProblemId":9, "Problem": "Diarrhea", "ProblemStripped": "Diarrhea"},{"ProblemId":10, "Problem": "Dull/Weakness", "ProblemStripped": "DullWeakness"},{"ProblemId":11, "Problem": "Ear problem", "ProblemStripped": "Earproblem"},{"ProblemId":12, "Problem": "Eye problem", "ProblemStripped": "Eyeproblem"},{"ProblemId":13, "Problem": "For ABC", "ProblemStripped": "ForABC"},{"ProblemId":14, "Problem": "Horn/hoof problem", "ProblemStripped": "HornHoofproblem"},{"ProblemId":15, "Problem": "Item Tied/Stuck on Body", "ProblemStripped": "ItemTiedStuckonBody"},{"ProblemId":16, "Problem": "Leg problem", "ProblemStripped": "Legproblem"},{"ProblemId":17, "Problem": "Mouth Open", "ProblemStripped": "MouthOpen"},{"ProblemId":18, "Problem": "Normal behaviour - biting", "ProblemStripped": "NormalBehaviour-Biting"},{"ProblemId":19, "Problem": "Nose Bleeding", "ProblemStripped": "NoseBleeding"},{"ProblemId":20, "Problem": "Orphan", "ProblemStripped": "Orphan"},{"ProblemId":21, "Problem": "Penis coming out", "ProblemStripped": "PenisComingOut"},{"ProblemId":22, "Problem": "Pregnancy problem", "ProblemStripped": "Pregnancyproblem"},{"ProblemId":23, "Problem": "Shifted puppies", "ProblemStripped": "Shiftedpuppies"},{"ProblemId":24, "Problem": "Recumbent", "ProblemStripped": "Recumbent"},{"ProblemId":25, "Problem": "Respiratory", "ProblemStripped": "Respiratory"},{"ProblemId":26, "Problem": "Rectal Prolapse", "ProblemStripped": "RectalProlapse"},{"ProblemId":27, "Problem": "Salivating/Foaming", "ProblemStripped": "SalivatingFoaming"},{"ProblemId":28, "Problem": "Seizure", "ProblemStripped": "Seizure"},{"ProblemId":29, "Problem": "Skin problem", "ProblemStripped": "Skinproblem"},{"ProblemId":30, "Problem": "Stomach problem/Collic", "ProblemStripped": "StomachproblemCollic"},{"ProblemId":31, "Problem": "Stuck/Trapped", "ProblemStripped": "StuckTrapped"},{"ProblemId":32, "Problem": "Swelling other than Leg/Abdominal Swelling", "ProblemStripped": "SwellingotherthanLegAbdominalSwelling"},{"ProblemId":33, "Problem": "Tick/Flea Infestation", "ProblemStripped": "TickFleaInfestation"},{"ProblemId":34, "Problem": "Tumor", "ProblemStripped": "Tumor"},{"ProblemId":35, "Problem": "Twitching", "ProblemStripped": "Twitching"},{"ProblemId":36, "Problem": "Very skinny", "ProblemStripped": "Veryskinny"},{"ProblemId":37, "Problem": "Vaginal/Penis Discharge/Bleeding", "ProblemStripped": "VaginalPenisDischargeBleeding"},{"ProblemId":38, "Problem": "Vomiting", "ProblemStripped": "Vomiting"},{"ProblemId":39, "Problem": "Vaginal Prolapse", "ProblemStripped": "VaginalProlapse"},{"ProblemId":40, "Problem": "Wound", "ProblemStripped": "Wound"},{"ProblemId":41, "Problem": "Shell Problem", "ProblemStripped": "ShellProblem"}];
  // }

  //   return this.problems$;
  // }

  getProblems(): Observable<ProblemDropdownResponse[]> {

    let request = "/Problems";

    if (!this.problems$)
    {
      this.problems$ = this.getObservable(request)
      .pipe(
        map((response:ProblemDropdownResponse[]) => {
          return response;
        })
      );
    }

    return this.problems$;
  }

  getIsoReasons() {
    if (!this.isoReasons$)
    {
      this.isoReasons$ = [{"id":1,"isoReason":"Breathing Problem"},{"id":2,"isoReason":"Nasal Discharge"},{"id":3,"isoReason":"Eye Discharge"},{"id":4,"isoReason":"Coughing"},{"id":5,"isoReason":"Diarrhea"},{"id":6,"isoReason":"Circling"},{"id":7,"isoReason":"Twitching"},{"id":8,"isoReason":"Nuerological"},{"id":9,"isoReason":"Rabies Suspected"},];
    }

    return this.isoReasons$;
  }

  getAntibiotics() {
    if (!this.antibiotics$)
    {
      this.antibiotics$ = [{"id":1,"antibiotic":"Amoxicillin"},{"id":2,"antibiotic":"Azithromycin"},{"id":3,"antibiotic":"Bactoclav"},{"id":4,"antibiotic":"Biotrim"},{"id":5,"antibiotic":"Bovicef"},{"id":6,"antibiotic":"Cefpet"},{"id":7,"antibiotic":"Clindamycin"},{"id":8,"antibiotic":"Doxycycline"},{"id":9,"antibiotic":"Enrofloxacin"},{"id":10,"antibiotic":"Intacef"},{"id":11,"antibiotic":"Meloxicam"},{"id":12,"antibiotic":"Metrogyl"},{"id":13,"antibiotic":"Metronidazole"},{"id":14,"antibiotic":"Metroxyl"},{"id":15,"antibiotic":"Penicillin"},{"id":16,"antibiotic":"Septran"},{"id":17,"antibiotic":"Tramadol"},{"id":18,"antibiotic":"Tribivet"}];
    }

    return this.antibiotics$;
  }

  getAreas() {
    if (!this.areas$)
    {
      this.areas$ = [{"id": 1,"areaName": "Aayad"},	{"id": 2,"areaName": "Alipura"}, {"id": 3,"areaName": "Ambamata"},	{"id": 4,"areaName": "Ambavgarh"},	{"id": 5,"areaName": "Amberi"},	{"id": 6,"areaName": "Ashok Nagar"},	{"id": 7,"areaName": "Ashwini Bazar"},	{"id": 8,"areaName": "Awarimata"},	{"id": 9,"areaName": "Bada Bazar"},	{"id": 10,"areaName": "Bada Hawala"},	{"id": 11,"areaName": "Badgaon"},	{"id": 12,"areaName": "Badi"},	{"id": 13,"areaName": "Badi holi"},	{"id": 14,"areaName": "Balicha"},	{"id": 15,"areaName": "Bapu Bazar"},	{"id": 16,"areaName": "Bara Pal"},	{"id": 17,"areaName": "Bedla"},	{"id": 18,"areaName": "Bedwas"},	{"id": 19,"areaName": "Bhatt Ji Ki Badi"},	{"id": 20,"areaName": "Bhatyani chohtta"},	{"id": 21,"areaName": "Bhillo ka bedla"},	{"id": 22,"areaName": "Bhupalpura"},	{"id": 23,"areaName": "Bhuwana"},	{"id": 24,"areaName": "Bohra Ganesh Ji"},	{"id": 25,"areaName": "Brahmpole"},	{"id": 26,"areaName": "Boharwadi"},	{"id": 27,"areaName": "Bujra"},	{"id": 28,"areaName": "Bunjara"},	{"id": 29,"areaName": "Chandpole"},	{"id": 30,"areaName": "Chetak"},	{"id": 31,"areaName": "Chikalwas"},	{"id": 32,"areaName": "Chitrakut Nagar"},	{"id": 33,"areaName": "Court Choraya"},	{"id": 34,"areaName": "Dabok"},	{"id": 35,"areaName": "Dakon Kotda"},	{"id": 36,"areaName": "Dangiyo Ka Guda"},	{"id": 37,"areaName": "Debari"},	{"id": 38,"areaName": "Delhigate"},	{"id": 39,"areaName": "Delwada"},	{"id": 40,"areaName": "Detyamagri"},	{"id": 41,"areaName": "Dewali"},	{"id": 42,"areaName": "Dhanmandi"},	{"id": 43,"areaName": "Dhar"},	{"id": 44,"areaName": "Dholi magri"},	{"id": 45,"areaName": "Doodh Talai"},	{"id": 46,"areaName": "Durganursary"},	{"id": 47,"areaName": "Eklingpura"},	{"id": 48,"areaName": "Fatehpura"},	{"id": 49,"areaName": "Fatehsagar"},	{"id": 50,"areaName": "Gangour Ghat"},	{"id": 51,"areaName": "Ganesh ghati"},	{"id": 52,"areaName": "Gariyawas"},	{"id": 53,"areaName": "Ghantaghar"},	{"id": 54,"areaName": "Gorela"},	{"id": 55,"areaName": "Goverdhan Villas"},	{"id": 56,"areaName": "Govindpura"},	{"id": 57,"areaName": "Gulab Baag"},	{"id": 58,"areaName": "Haldi Ghati"},	{"id": 59,"areaName": "Hathipole"},	{"id": 60,"areaName": "Hawala"},	{"id": 61,"areaName": "Iswal"},	{"id": 62,"areaName": "Jagdish Chowk"},	{"id": 63,"areaName": "Jawahar nagar"},	{"id": 64,"areaName": "Jawar Mines"},	{"id": 65,"areaName": "Jini Ret"},	{"id": 66,"areaName": "Kailashpuri"},	{"id": 67,"areaName": "Kala Ji Gora Ji"},	{"id": 68,"areaName": "Kaladwas"},	{"id": 69,"areaName": "Kalarohi"},	{"id": 70,"areaName": "Kalka mata road"},	{"id": 71,"areaName": "Kankroli"},	{"id": 72,"areaName": "Kanpur Madri"},	{"id": 73,"areaName": "Kavita"},	{"id": 74,"areaName": "Keshav nagar"},	{"id": 75,"areaName": "Khanjipeer"},	{"id": 76,"areaName": "Khempura"},	{"id": 77,"areaName": "Kheradiwada"},	{"id": 78,"areaName": "Kishanpole"},	{"id": 79,"areaName": "Krishna Pura"},	{"id": 80,"areaName": "Kodiyat"},	{"id": 81,"areaName": "Kumharo Ka Bhatta"},	{"id": 82,"areaName": "Kundal"},	{"id": 83,"areaName": "Lakadwas"},	{"id": 84,"areaName": "Lakhawali"},	{"id": 85,"areaName": "Liyo Ka Guda"},	{"id": 86,"areaName": "Loyra"},	{"id": 87,"areaName": "Maaldas Street"},	{"id": 88,"areaName": "Machla Mangra"},	{"id": 89,"areaName": "Madhuban"},	{"id": 90,"areaName": "Madri"},	{"id": 91,"areaName": "Malla Talai"},	{"id": 92,"areaName": "Manvakheda"},	{"id": 93,"areaName": "Mavli"},	{"id": 94,"areaName": "Morwaniya"},	{"id": 95,"areaName": "Moti Mangri"},	{"id": 96,"areaName": "Motichouhata"},	{"id": 97,"areaName": "Mukherjee chowk"},	{"id": 98,"areaName": "Naai"},	{"id": 99,"areaName": "Nathdwara"},	{"id": 100,"areaName": "Nayion Ki Talai"},	{"id": 101,"areaName": "Neemuch Kheda"},	{"id": 102,"areaName": "Nela"},	{"id": 103,"areaName": "Nohra"},	{"id": 104,"areaName": "Outside Udaipur"},	{"id": 105,"areaName": "Paldi"},	{"id": 106,"areaName": "Panchwati"},	{"id": 107,"areaName": "Paneriyo Ki Madri"},	{"id": 108,"areaName": "Paras"},	{"id": 109,"areaName": "Patel Circle"},	{"id": 110,"areaName": "Pahada"},	{"id": 111,"areaName": "Picholi"},	{"id": 112,"areaName": "Polo Ground"},	{"id": 113,"areaName": "Pratap Nagar"},	{"id": 114,"areaName": "Pula"},	{"id": 115,"areaName": "Purohito Ki Madri"},	{"id": 116,"areaName": "Raghunathpura"},	{"id": 117,"areaName": "Rajsamand"},	{"id": 118,"areaName": "Rampura"},	{"id": 119,"areaName": "Rani Road"},	{"id": 120,"areaName": "Raoji Ka Hata"},	{"id": 121,"areaName": "Roopsagar"},	{"id": 122,"areaName": "Reti Stand"},	{"id": 123,"areaName": "Sabalpura"},	{"id": 124,"areaName": "Sahelinagar"},	{"id": 125,"areaName": "Saheliyo Ki Bari"},	{"id": 126,"areaName": "Sajjangarh"},	{"id": 127,"areaName": "Sajjan Nagar"},	{"id": 128,"areaName": "Sapetia"},	{"id": 129,"areaName": "Sardarpura"},	{"id": 130,"areaName": "Sarvritu Villlas"},	{"id": 131,"areaName": "Sastri Circle"},	{"id": 132,"areaName": "Savina"},	{"id": 133,"areaName": "Sector 1"},	{"id": 134,"areaName": "Sector 2"},	{"id": 135,"areaName": "Sector 3"},	{"id": 136,"areaName": "Sector 4"},	{"id": 137,"areaName": "Sector 5"},	{"id": 138,"areaName": "Sector 6"},	{"id": 139,"areaName": "Sector 7"},	{"id": 140,"areaName": "Sector 8"},	{"id": 141,"areaName": "Sector 9"},	{"id": 142,"areaName": "Sector 11"},	{"id": 143,"areaName": "Sector 12"},	{"id": 144,"areaName": "Sector 13"},	{"id": 145,"areaName": "Sector 14"},	{"id": 146,"areaName": "Shakti Nagar"},	{"id": 147,"areaName": "Shastri Circle"},	{"id": 148,"areaName": "Shobhagpura"},	{"id": 149,"areaName": "Sifan"},	{"id": 150,"areaName": "Sisarma"},	{"id": 151,"areaName": "Subhash Nagar"},	{"id": 152,"areaName": "Sukhadiya Circle"},	{"id": 153,"areaName": "Sukher"},	{"id": 154,"areaName": "Sunderwas"},	{"id": 155,"areaName": "Surajpole"},	{"id": 156,"areaName": "Sutharwada"},	{"id": 157,"areaName": "Swaroopsagar"},	{"id": 158,"areaName": "Sweaasharam"},	{"id": 159,"areaName": "Tekri"},	{"id": 160,"areaName": "Thokar"},	{"id": 161,"areaName": "Thoor"},	{"id": 162,"areaName": "Tiger Hills"},	{"id": 163,"areaName": "Titardi"},	{"id": 164,"areaName": "Town hall"},	{"id": 165,"areaName": "Udaiyapole"},	{"id": 166,"areaName": "Lalgath"},	{"id": 167,"areaName": "UIT Puliya"},	{"id": 168,"areaName": "Umarda"},	{"id": 169,"areaName": "University"},{"id": 170,"areaName": "Varda"},{"id": 171,"areaName": "Vallabhnagar"},{"id": 172,"areaName": "Viliya"}];
    }

    return this.areas$;
  }

  getCrueltyInspectors(): Observable<User[]> {

    let request = "/CrueltyStaff";

    if (!this.crueltyIspectors$)
    {
      this.crueltyIspectors$ = this.getObservable(request)
      .pipe(
        map((response:User[]) => {
          return response;
        })
      );}

    return this.crueltyIspectors$;
  }

  getDispatchers(): Observable<User[]> {

    let request = "/Dispatchers";

    if (!this.dispatchers$)
    {
      this.dispatchers$ = this.getObservable(request)
      .pipe(
        map((response:User[]) => {
          return response;
        })
      );
    }

    return this.dispatchers$;

  }

  getCallOutcomes(): Observable<CallOutcomeResponse[]> {

    let request = "/CallOutcomes";

    if (!this.callOutcomes$)
    {
      this.callOutcomes$ = this.getObservable(request)
      .pipe(
        map((response:CallOutcomeResponse[]) => {
          return response;
        })
      );
    }
    return this.callOutcomes$;

  }

  getRescuers(): Observable<User[]> {

    let request = "/Rescuers";

    if (!this.rescuers$)
    {
      this.rescuers$ = this.getObservable(request)
      .pipe(
        map((response:User[]) => {
          return response;
        })
      );
    }

    return this.rescuers$;

  }

  getEmergencyCodes(): Observable<EmergencyCode[]> {

    let request = "/EmergencyCodes";

    if (!this.emergencyCodes$)
    {
      this.emergencyCodes$ = this.getObservable(request)
      .pipe(
        map((response:EmergencyCode[]) => {
          return response;
        })
      );
    }

    return this.emergencyCodes$;
  }

  getPatientStates(): Observable<PatientStatus[]> {

    let request = "/PatientStates";

    if (!this.patientStates$)
    {
      this.patientStates$ = this.getObservable(request)
      .pipe(
        map((response:PatientStatus[]) => {
          return response;
        })
      );
    }

    return this.patientStates$;
  }

  getCallTypes(): Observable<CallType[]> {

    let request = "/CallTypes";

    if (!this.callTypes$)
    {
      this.callTypes$ = this.getObservable(request)
      .pipe(
        map((response:CallType[]) => {
          return response;
        })
      );
    }

    return this.callTypes$;
  }

  getPatientCallOutcomes(): Observable<PatientCallOutcome[]> {

    let request = "/PatientCallOutcomes";

    if (!this.patientCallOutcome$)
    {
      this.patientCallOutcome$ = this.getObservable(request)
      .pipe(
        map((response:PatientCallOutcome[]) => {
          return response;
        })
      );
    }

    return this.patientCallOutcome$;
  }



}
