import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Species } from '../../models/species';
import { shareReplay } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DropdownService {

  private species$;//: Observable<Species[]>;
  private drivers$;
  private workers$;
  private areas$:any[];
  private dispatchers$;
  private outcomes$;

  constructor(private http: HttpClient) { }

  getAreas() {
    if (!this.areas$)
    {
      this.areas$ = [{"id": 1,"areaName": "Aayad"},	{"id": 2,"areaName": "Alipura"}, {"id": 3,"areaName": "Ambamata"},	{"id": 4,"areaName": "Ambavgarh"},	{"id": 5,"areaName": "Amberi"},	{"id": 6,"areaName": "Ashok Nagar"},	{"id": 7,"areaName": "Ashwini Bazar"},	{"id": 8,"areaName": "Awarimata"},	{"id": 9,"areaName": "Bada Bazar"},	{"id": 10,"areaName": "Bada Hawala"},	{"id": 11,"areaName": "Badgaon"},	{"id": 12,"areaName": "Badi"},	{"id": 13,"areaName": "Badi holi"},	{"id": 14,"areaName": "Balicha"},	{"id": 15,"areaName": "Bapu Bazar"},	{"id": 16,"areaName": "Bara Pal"},	{"id": 17,"areaName": "Bedla"},	{"id": 18,"areaName": "Bedwas"},	{"id": 19,"areaName": "Bhatt Ji Ki Badi"},	{"id": 20,"areaName": "Bhatyani chohtta"},	{"id": 21,"areaName": "Bhillo ka bedla"},	{"id": 22,"areaName": "Bhupalpura"},	{"id": 23,"areaName": "Bhuwana"},	{"id": 24,"areaName": "Bohra Ganesh Ji"},	{"id": 25,"areaName": "Brahmpole"},	{"id": 26,"areaName": "Boharwadi"},	{"id": 27,"areaName": "Bujra"},	{"id": 28,"areaName": "Bunjara"},	{"id": 29,"areaName": "Chandpole"},	{"id": 30,"areaName": "Chetak"},	{"id": 31,"areaName": "Chikalwas"},	{"id": 32,"areaName": "Chitrakut Nagar"},	{"id": 33,"areaName": "Court Choraya"},	{"id": 34,"areaName": "Dabok"},	{"id": 35,"areaName": "Dakon Kotda"},	{"id": 36,"areaName": "Dangiyo Ka Guda"},	{"id": 37,"areaName": "Debari"},	{"id": 38,"areaName": "Delhigate"},	{"id": 39,"areaName": "Delwada"},	{"id": 40,"areaName": "Detyamagri"},	{"id": 41,"areaName": "Dewali"},	{"id": 42,"areaName": "Dhanmandi"},	{"id": 43,"areaName": "Dhar"},	{"id": 44,"areaName": "Dholi magri"},	{"id": 45,"areaName": "Doodh Talai"},	{"id": 46,"areaName": "Durganursary"},	{"id": 47,"areaName": "Eklingpura"},	{"id": 48,"areaName": "Fatehpura"},	{"id": 49,"areaName": "Fatehsagar"},	{"id": 50,"areaName": "Gangour Ghat"},	{"id": 51,"areaName": "Ganesh ghati"},	{"id": 52,"areaName": "Gariyawas"},	{"id": 53,"areaName": "Ghantaghar"},	{"id": 54,"areaName": "Gorela"},	{"id": 55,"areaName": "Goverdhan Villas"},	{"id": 56,"areaName": "Govindpura"},	{"id": 57,"areaName": "Gulab Baag"},	{"id": 58,"areaName": "Haldi Ghati"},	{"id": 59,"areaName": "Hathipole"},	{"id": 60,"areaName": "Hawala"},	{"id": 61,"areaName": "Iswal"},	{"id": 62,"areaName": "Jagdish Chowk"},	{"id": 63,"areaName": "Jawahar nagar"},	{"id": 64,"areaName": "Jawar Mines"},	{"id": 65,"areaName": "Jini Ret"},	{"id": 66,"areaName": "Kailashpuri"},	{"id": 67,"areaName": "Kala Ji Gora Ji"},	{"id": 68,"areaName": "Kaladwas"},	{"id": 69,"areaName": "Kalarohi"},	{"id": 70,"areaName": "Kalka mata road"},	{"id": 71,"areaName": "Kankroli"},	{"id": 72,"areaName": "Kanpur Madri"},	{"id": 73,"areaName": "Kavita"},	{"id": 74,"areaName": "Keshav nagar"},	{"id": 75,"areaName": "Khanjipeer"},	{"id": 76,"areaName": "Khempura"},	{"id": 77,"areaName": "Kheradiwada"},	{"id": 78,"areaName": "Kishanpole"},	{"id": 79,"areaName": "Krishna Pura"},	{"id": 80,"areaName": "Kodiyat"},	{"id": 81,"areaName": "Kumharo Ka Bhatta"},	{"id": 82,"areaName": "Kundal"},	{"id": 83,"areaName": "Lakadwas"},	{"id": 84,"areaName": "Lakhawali"},	{"id": 85,"areaName": "Liyo Ka Guda"},	{"id": 86,"areaName": "Loyra"},	{"id": 87,"areaName": "Maaldas Street"},	{"id": 88,"areaName": "Machla Mangra"},	{"id": 89,"areaName": "Madhuban"},	{"id": 90,"areaName": "Madri"},	{"id": 91,"areaName": "Malla Talai"},	{"id": 92,"areaName": "Manvakheda"},	{"id": 93,"areaName": "Mavli"},	{"id": 94,"areaName": "Morwaniya"},	{"id": 95,"areaName": "Moti Mangri"},	{"id": 96,"areaName": "Motichouhata"},	{"id": 97,"areaName": "Mukherjee chowk"},	{"id": 98,"areaName": "Naai"},	{"id": 99,"areaName": "Nathdwara"},	{"id": 100,"areaName": "Nayion Ki Talai"},	{"id": 101,"areaName": "Neemuch Kheda"},	{"id": 102,"areaName": "Nela"},	{"id": 103,"areaName": "Nohra"},	{"id": 104,"areaName": "Outside Udaipur"},	{"id": 105,"areaName": "Paldi"},	{"id": 106,"areaName": "Panchwati"},	{"id": 107,"areaName": "Paneriyo Ki Madri"},	{"id": 108,"areaName": "Paras"},	{"id": 109,"areaName": "Patel Circle"},	{"id": 110,"areaName": "Pahada"},	{"id": 111,"areaName": "Picholi"},	{"id": 112,"areaName": "Polo Ground"},	{"id": 113,"areaName": "Pratap Nagar"},	{"id": 114,"areaName": "Pula"},	{"id": 115,"areaName": "Purohito Ki Madri"},	{"id": 116,"areaName": "Raghunathpura"},	{"id": 117,"areaName": "Rajsamand"},	{"id": 118,"areaName": "Rampura"},	{"id": 119,"areaName": "Rani Road"},	{"id": 120,"areaName": "Raoji Ka Hata"},	{"id": 121,"areaName": "Roopsagar"},	{"id": 122,"areaName": "Reti Stand"},	{"id": 123,"areaName": "Sabalpura"},	{"id": 124,"areaName": "Sahelinagar"},	{"id": 125,"areaName": "Saheliyo Ki Bari"},	{"id": 126,"areaName": "Sajjangarh"},	{"id": 127,"areaName": "Sajjan Nagar"},	{"id": 128,"areaName": "Sapetia"},	{"id": 129,"areaName": "Sardarpura"},	{"id": 130,"areaName": "Sarvritu Villlas"},	{"id": 131,"areaName": "Sastri Circle"},	{"id": 132,"areaName": "Savina"},	{"id": 133,"areaName": "Sector 1"},	{"id": 134,"areaName": "Sector 2"},	{"id": 135,"areaName": "Sector 3"},	{"id": 136,"areaName": "Sector 4"},	{"id": 137,"areaName": "Sector 5"},	{"id": 138,"areaName": "Sector 6"},	{"id": 139,"areaName": "Sector 7"},	{"id": 140,"areaName": "Sector 8"},	{"id": 141,"areaName": "Sector 9"},	{"id": 142,"areaName": "Sector 11"},	{"id": 143,"areaName": "Sector 12"},	{"id": 144,"areaName": "Sector 13"},	{"id": 145,"areaName": "Sector 14"},	{"id": 146,"areaName": "Shakti Nagar"},	{"id": 147,"areaName": "Shastri Circle"},	{"id": 148,"areaName": "Shobhagpura"},	{"id": 149,"areaName": "Sifan"},	{"id": 150,"areaName": "Sisarma"},	{"id": 151,"areaName": "Subhash Nagar"},	{"id": 152,"areaName": "Sukhadiya Circle"},	{"id": 153,"areaName": "Sukher"},	{"id": 154,"areaName": "Sunderwas"},	{"id": 155,"areaName": "Surajpole"},	{"id": 156,"areaName": "Sutharwada"},	{"id": 157,"areaName": "Swaroopsagar"},	{"id": 158,"areaName": "Sweaasharam"},	{"id": 159,"areaName": "Tekri"},	{"id": 160,"areaName": "Thokar"},	{"id": 161,"areaName": "Thoor"},	{"id": 162,"areaName": "Tiger Hills"},	{"id": 163,"areaName": "Titardi"},	{"id": 164,"areaName": "Town hall"},	{"id": 165,"areaName": "Udaiyapole"},	{"id": 166,"areaName": "Lalgath"},	{"id": 167,"areaName": "UIT Puliya"},	{"id": 168,"areaName": "Umarda"},	{"id": 169,"areaName": "University"},{"id": 170,"areaName": "Varda"},{"id": 171,"areaName": "Vallabhnagar"},{"id": 172,"areaName": "Viliya"}];
}

    return this.areas$;
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
      this.outcomes$ = [{"id": 1,"outcome": "Admission"},{"id": 2,"outcome": "Animal died (complainer informed)"},{"id": 3,"outcome": "Animal good (rescue not needed)"},{"id": 4,"outcome": "Animal gone (complainer informed)"},{"id": 5,"outcome": "Animal taken to polyclinic or zoo"},{"id": 6,"outcome": "Animal treated on site"},{"id": 7,"outcome": "Complainer called back (rescue no longer required)"},{"id": 8,"outcome": "Complainer not reachable"},{"id": 9,"outcome": "Cruelty staff informed - Animal not rescued"},{"id": 10,"outcome": "Died in ambulance"},{"id": 11,"outcome": "Found dead"},{"id": 12,"outcome": "Failure to catch"},{"id": 13,"outcome": "Medicine given to complainer"},{"id": 14,"outcome": "Owner found (rescue no longer required)"},{"id": 15,"outcome": "Rescued/resolved"},{"id": 16,"outcome": "Same As"},{"id": 17,"outcome": "Staff can't find animal"},{"id": 18,"outcome": "Street treatment approved by ST manager"},{"id": 19,"outcome": "Third party rescued,"}];
    }

    return this.outcomes$;
  }

  getDrivers() {
    if (!this.drivers$)
    {
      this.drivers$ = [{"id": null,"name":null},{"id": 1, "driver": "Baghat Singh"},{"id": 2, "driver": "Jagdish"},{"id": 3, "driver": "Kalu Singh"},{"id": 4, "driver": "Laxman Singh"},{"id": 5, "driver": "Kamlesh"},{"id": 6, "driver": "Devi Singh"},{"id": 7, "driver": "Self"}]
    }

    return this.drivers$;
  }

  getWorkers() {
    if (!this.workers$)
    {
      this.workers$ = [{"id": null,"name":null},{"id": 1, "worker": "Nandu"},{"id": 2, "worker": "Ganpat"},{"id": 3, "worker": "Sanjay"},{"id": 4, "worker": "Mahender"},{"id": 5, "worker": "Pushkar"},{"id": 7, "worker": "Vinod"},{"id": 8, "worker": "Deendeyal"},{"id": 9, "worker": "Heera"},{"id": 10, "worker": "Dharmendra"},{"id": 11, "worker": "Kamlesh"},{"id": 12, "worker": "Self"}]
    }

    return this.workers$;
  }

  

  getSpecies() {
    if (!this.species$)
    {
      this.species$ = [{"id": 1,"animalType": "Dog"},	{"id": 2,"animalType": "Puppy"},	{"id": 3,"animalType": "Cow"},	{"id": 4,"animalType": "Bull"},	{"id": 5,"animalType": "Calf"},	{"id": 6,"animalType": "Donkey"},	{"id": 7,"animalType": "Cat"},	{"id": 8,"animalType": "Bird"},	{"id": 9,"animalType": "Goat"},	{"id": 10,"animalType": "Pig"},	{"id": 11,"animalType": "Kitten"},	{"id": 12,"animalType": "Sheep"},	{"id": 13,"animalType": "Buffalo"},	{"id": 14,"animalType": "Parrot"},	{"id": 15,"animalType": "Squirrel"},	{"id": 16,"animalType": "Fox"},	{"id": 17,"animalType": "Camel"},	{"id": 18,"animalType": "Pigeon"},	{"id": 19,"animalType": "Sparrow"},{"id": 20,"animalType": "Horse"},{"id": 21,"animalType": "Tortoise"},{"id": 22,"animalType": "Chicken"}];
    }

    return this.species$;
  }

  //This method should be used when the API is up nd running to cache
  //the response of this api call. We're going to be getting these dropdowns a heck 
  //of a lot and shouldn't hit the database each time.
  // getSpecies(): Observable<Species[]> {
  //   if (!this.species$)
  //   {
  //     this.species$ = this.http
  //     .get<Species[]>("api/getSpecies")
  //     .pipe(shareReplay(1,10000))
  //   }

  //   return this.species$;
  // }
}
