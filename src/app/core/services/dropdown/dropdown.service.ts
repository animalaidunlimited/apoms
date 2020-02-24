import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { AnimalType } from '../../models/animal-type';
import { map, shareReplay, catchError } from 'rxjs/operators';


export interface AnimalTypeResponse {
  data: AnimalType[];
}


@Injectable({
  providedIn: 'root'
})
export class DropdownService {

  rescuer1$;
  rescuer2$;
  areas$:any[];
  dispatchers$;
  outcomes$;
  crueltyIspectors$;
  antibiotics$;
  isoReasons$;
  animalTypes$:Observable<AnimalType[]>;
  problems$;
  exclusions$;
  officeStaff$;


  constructor(private http: HttpClient) {
  }

  getOfficeStaff(){
    if (!this.officeStaff$)
    {
      this.officeStaff$ = [{"id":1,"name":"Kiran"},{"id":2,"name":"Komal"}];
    }

    return this.officeStaff$;
  }

  getExclusions() {
    if (!this.exclusions$)
    {
      this.exclusions$ = [{"animalType":"Bird","exclusionList":["Horn/Hoof problem","Normal Behaviour - Biting","Penis Coming Out","Pregnancy problem","Shifted puppies"]},{"animalType":"Buffalo","exclusionList":["Can't Fly","Shifted puppies"]},{"animalType":"Buffalo Calf","exclusionList":["Can't Fly","Shifted puppies"]},{"animalType":"Bull","exclusionList":["Can't Fly","Shifted puppies"]},{"animalType":"Calf","exclusionList":["Can't Fly","Shifted puppies","Pregnancy problem"]},{"animalType":"Camel","exclusionList":["Can't Fly","Shifted puppies"]},{"animalType":"Cat","exclusionList":["Can't Fly","Shifted puppies"]},{"animalType":"Chicken","exclusionList":["Horn/Hoof problem","Normal Behaviour - Biting","Penis Coming Out","Pregnancy problem","Shifted puppies"]},{"animalType":"Cow","exclusionList":["Can't Fly","Shifted puppies"]},{"animalType":"Dog","exclusionList":["Can't Fly"]},{"animalType":"Donkey","exclusionList":["Can't Fly","Shifted puppies"]},{"animalType":"Fox","exclusionList":["Can't Fly","Shifted puppies"]},{"animalType":"Goat","exclusionList":["Can't Fly","Shifted puppies"]},{"animalType":"Horse","exclusionList":["Can't Fly","Shifted puppies"]},{"animalType":"Kitten","exclusionList":["Can't Fly","Shifted puppies"]},{"animalType":"Parrot","exclusionList":["Horn/Hoof problem","Normal Behaviour - Biting","Penis Coming Out","Pregnancy problem","Shifted puppies"]},{"animalType":"Pig","exclusionList":["Can't Fly","Shifted puppies"]},{"animalType":"Pigeon","exclusionList":["Horn/Hoof problem","Normal Behaviour - Biting","Penis Coming Out","Pregnancy problem","Shifted puppies"]},{"animalType":"Puppy","exclusionList":["Can't Fly"]},{"animalType":"Sheep","exclusionList":["Can't Fly","Shifted puppies"]},{"animalType":"Sparrow","exclusionList":["Horn/Hoof problem","Normal Behaviour - Biting","Penis Coming Out","Pregnancy problem","Shifted puppies"]},{"animalType":"Squirrel","exclusionList":["Can't Fly","Shifted puppies"]},{"animalType":"Tortoise","exclusionList":["Can't Fly","Shifted puppies"]}];
    }

    return this.exclusions$;
  }

  //Here we get the response and map it to our observable array and then use
  //share replay for caching to avoid hitting the API every time we want to add
  //a new case
  getAnimalTypes(): Observable<AnimalType[]> {

    console.log("Hitting the /Case route");

    if (!this.animalTypes$)
    {
      this.animalTypes$ = this.http
      .get<AnimalTypeResponse>("/Case/GetAnimalType").pipe(
        map( (res) => {return res.data})//,
        //shareReplay(1,10000)
      )
    }

    return this.animalTypes$;

  }

  // getAnimalTypes() {
  //   if (!this.animalTypes$)
  //   {
  //     this.animalTypes$ = [{"id": 1,"animalType": "Dog"},	{"id": 2,"animalType": "Puppy"},	{"id": 3,"animalType": "Cow"},	{"id": 4,"animalType": "Bull"},	{"id": 5,"animalType": "Calf"},	{"id": 6,"animalType": "Donkey"},	{"id": 7,"animalType": "Cat"},	{"id": 8,"animalType": "Bird"},	{"id": 9,"animalType": "Goat"},	{"id": 10,"animalType": "Pig"},	{"id": 11,"animalType": "Kitten"},	{"id": 12,"animalType": "Sheep"},	{"id": 13,"animalType": "Buffalo"},	{"id": 14,"animalType": "Parrot"},	{"id": 15,"animalType": "Squirrel"},	{"id": 16,"animalType": "Fox"},	{"id": 17,"animalType": "Camel"},	{"id": 18,"animalType": "Pigeon"},	{"id": 19,"animalType": "Sparrow"},{"id": 20,"animalType": "Horse"},{"id": 21,"animalType": "Tortoise"},{"id": 22,"animalType": "Chicken"}];
  //   }

  //   return this.animalTypes$;
  // }

  getProblems() {
    if (!this.problems$)
    {
      this.problems$ =[{"id":1, "problem": "Abnormal Behaviour","problemStripped": "AbnormalBehaviour"},{"id":2, "problem": "Abnormal Walking", "problemStripped": "AbnormalWalking"},{"id":3, "problem": "Abnormal Behaviour Biting", "problemStripped": "AbnormalBehaviourBiting"},{"id":4, "problem": "Anorexia", "problemStripped": "Anorexia"},{"id":5, "problem": "Blind", "problemStripped": "Blind"},{"id":6, "problem": "Can't Fly", "problemStripped": "Cantfly"},{"id":7, "problem": "Circling", "problemStripped": "Circling"},{"id":8, "problem": "Cruelty", "problemStripped": "Cruelty"},{"id":9, "problem": "Diarrhea", "problemStripped": "Diarrhea"},{"id":10, "problem": "Dull/Weakness", "problemStripped": "DullWeakness"},{"id":11, "problem": "Ear problem", "problemStripped": "Earproblem"},{"id":12, "problem": "Eye problem", "problemStripped": "Eyeproblem"},{"id":13, "problem": "For ABC", "problemStripped": "ForABC"},{"id":14, "problem": "Horn/Hoof problem", "problemStripped": "HornHoofproblem"},{"id":15, "problem": "Item Tied/Stuck on Body", "problemStripped": "ItemTiedStuckonBody"},{"id":16, "problem": "Leg problem", "problemStripped": "Legproblem"},{"id":17, "problem": "Mouth Open", "problemStripped": "MouthOpen"},{"id":18, "problem": "Normal Behaviour - Biting", "problemStripped": "NormalBehaviour-Biting"},{"id":19, "problem": "Nose Bleeding", "problemStripped": "NoseBleeding"},{"id":20, "problem": "Orphan", "problemStripped": "Orphan"},{"id":21, "problem": "Penis Coming Out", "problemStripped": "PenisComingOut"},{"id":22, "problem": "Pregnancy problem", "problemStripped": "Pregnancyproblem"},{"id":23, "problem": "Shifted puppies", "problemStripped": "Shiftedpuppies"},{"id":24, "problem": "Recumbent", "problemStripped": "Recumbent"},{"id":25, "problem": "Respiratory", "problemStripped": "Respiratory"},{"id":26, "problem": "Rectal Prolapse", "problemStripped": "RectalProlapse"},{"id":27, "problem": "Salivating/Foaming", "problemStripped": "SalivatingFoaming"},{"id":28, "problem": "Seizure", "problemStripped": "Seizure"},{"id":29, "problem": "Skin problem", "problemStripped": "Skinproblem"},{"id":30, "problem": "Stomach problem/Collic", "problemStripped": "StomachproblemCollic"},{"id":31, "problem": "Stuck/Trapped", "problemStripped": "StuckTrapped"},{"id":32, "problem": "Swelling other than Leg/Abdominal Swelling", "problemStripped": "SwellingotherthanLegAbdominalSwelling"},{"id":33, "problem": "Tick/Flea Infestation", "problemStripped": "TickFleaInfestation"},{"id":34, "problem": "Tumor", "problemStripped": "Tumor"},{"id":35, "problem": "Twitching", "problemStripped": "Twitching"},{"id":36, "problem": "Very skinny", "problemStripped": "Veryskinny"},{"id":37, "problem": "Vaginal/Penis Discharge/Bleeding", "problemStripped": "VaginalPenisDischargeBleeding"},{"id":38, "problem": "Vomiting", "problemStripped": "Vomiting"},{"id":39, "problem": "Vaginal Prolapse", "problemStripped": "VaginalProlapse"},{"id":40, "problem": "Wound", "problemStripped": "Wound"}];
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

  getCrueltyInspectors() {
    if (!this.crueltyIspectors$)
    {
      this.crueltyIspectors$ = [{"id": 1,"crueltyInspector": "Deendeyal"},	{"id": 2,"crueltyInspector": "Raj"}];
    }

    return this.crueltyIspectors$;
  }

  getDispatchers() {
    if (!this.dispatchers$)
    {
      this.dispatchers$ = [{"id": 1,"name":"Heera Lal"},{"id": 2,"name":"Kalpit"},{"id": 3,"name":"Kalu Singh"},{"id": 4,"name":"Manoj"},{"id": 5,"name":"Prakash"},]
    }

    return this.dispatchers$;
  }

  getOutcomes() {
    if (!this.outcomes$)
    {
      this.outcomes$ = [{"id": 1,"outcome": "Admission"},{"id": 2,"outcome": "Animal died (Caller informed)"},{"id": 3,"outcome": "Animal good (rescue not needed)"},{"id": 4,"outcome": "Animal gone (Caller informed)"},{"id": 5,"outcome": "Animal taken to polyclinic or zoo"},{"id": 6,"outcome": "Animal treated on site"},{"id": 7,"outcome": "Caller called back (rescue no longer required)"},{"id": 8,"outcome": "Caller not reachable"},{"id": 9,"outcome": "Cruelty staff informed - Animal not rescued"},{"id": 10,"outcome": "Died in ambulance"},{"id": 11,"outcome": "Found dead"},{"id": 12,"outcome": "Failure to catch"},{"id": 13,"outcome": "Medicine given to Caller"},{"id": 14,"outcome": "Owner found (rescue no longer required)"},{"id": 15,"outcome": "Rescued/resolved"},{"id": 16,"outcome": "Same As"},{"id": 17,"outcome": "Staff can't find animal"},{"id": 18,"outcome": "Street treatment approved by ST manager"},{"id": 19,"outcome": "Third party rescued,"}];
    }

    return this.outcomes$;
  }

  getRescuer1List() {
    if (!this.rescuer1$)
    {
      this.rescuer1$ = [{"id": null,"name":null},{"id": 1, "name": "Baghat Singh"},{"id": 2, "name": "Jagdish"},{"id": 3, "name": "Kalu Singh"},{"id": 4, "name": "Laxman Singh"},{"id": 5, "name": "Kamlesh"},{"id": 6, "name": "Devi Singh"},{"id": 7, "name": "Self"}]
    }

    return this.rescuer1$;
  }

  getRescuer2List() {
    if (!this.rescuer2$)
    {
      this.rescuer2$ = [{"id": null,"name":null},{"id": 1, "name": "Nandu"},{"id": 2, "name": "Ganpat"},{"id": 3, "name": "Sanjay"},{"id": 4, "name": "Mahender"},{"id": 5, "name": "Pushkar"},{"id": 7, "name": "Vinod"},{"id": 8, "name": "Deendeyal"},{"id": 9, "name": "Heera"},{"id": 10, "name": "Dharmendra"},{"id": 11, "name": "Kamlesh"},{"id": 12, "name": "Self"}]
    }

    return this.rescuer2$;
  }

}
