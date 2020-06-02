import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Validators , FormBuilder, AbstractControl } from '@angular/forms';
import { Surgeon , SurgerySite , SurgeryType ,SurgeryById, UpdatedSurgery, SurgeryFormModel} from "src/app/core/models/Surgery-details";
import { DropdownService } from "src/app/core/services/dropdown/dropdown.service";
import { Observable, iif } from 'rxjs';
import { SurgeryService } from "src/app/core/services/surgery/surgery.service";
import { AnimalType } from "src/app/core/models/animal-type";
import { getCurrentTimeString } from 'src/app/core/utils';
import { SurgeryRecord } from '../../hospital-manager/components/surgery-details/surgery-details.component';
import { filter, map, find } from 'rxjs/operators';
import { ITS_JUST_ANGULAR } from '@angular/core/src/r3_symbols';

interface Antibiotic{
  id : number;
  Antibiotics: string;
}


@Component({
  selector: 'surgery-record',
  templateUrl: './surgery-record.component.html',
  styleUrls: ['./surgery-record.component.scss']
})
export class SurgeryRecordComponent implements OnInit {
  @Input() surgeryId: number;
  @Input() patientId : number;
  @Input() tagNumber : string;
  @Input() emergencyNumber : number;
  @Input() animalType : string;
  @Output() public result = new EventEmitter<UpdatedSurgery>();
  surgeons: Surgeon[];
  surgerySites: SurgerySite[];
  surgeryTypes: SurgeryType[];
  surgeriesById : Observable<SurgeryById[]>;
  animalTypes$ : Observable<AnimalType[]>;
  surgeryDateTime;
  diedDateTime;
  callDateTime;

  DiedDate : AbstractControl;

  constructor(private fb: FormBuilder , private dropdown : DropdownService , private surgeryService : SurgeryService) { }

  SurgeryForm = this.fb.group({
    SurgeryId :[],
    PatientId :[],
    TagNumber :[''],
    EmergencyNumber:[],
    AnimalTypeId:[''],
    SurgeryDate:['',Validators.required],
    SurgeonId:[,Validators.required],
    SurgerySiteId:[,Validators.required],
    AnesthesiaMinutes:[],
    SurgeryTypeId:[,Validators.required],
    DiedDate:[''],
    DiedComment:[''],
    AntibioticsGiven:[,Validators.required],
    Comment:[''],
  });
  surgeonList;
  ngOnInit() {
    this.dropdown.getSurgeon().subscribe(surgeon => this.surgeons = surgeon );
    this.dropdown.getSurgerySite().subscribe(site=> this.surgerySites = site);
    this.dropdown.getSurgeryType().subscribe(type => this.surgeryTypes = type);
    this.animalTypes$ = this.dropdown.getAnimalTypes();
    this.surgeryService.getSurgeryBySurgeryId(this.surgeryId).then(response =>
    this.SurgeryForm.patchValue(response[0])
    );
   this.SurgeryForm.patchValue({PatientId:this.patientId ,TagNumber:this.tagNumber ,EmergencyNumber:this.emergencyNumber , AnimalTypeId : this.animalType});
  }

  drugs: Antibiotic[] = [
    {id : 1 ,Antibiotics: 'Yes'},
    {id: 2 ,Antibiotics: 'NO'}
  ];

// TODO: Abstract this out into the utils class.
  setInitialTime(event:FocusEvent)
  {
    let currentTime;
    currentTime = this.SurgeryForm.get((event.target as HTMLInputElement).name).value;

    if(!currentTime)
    {
      this.SurgeryForm.get((event.target as HTMLInputElement).name).setValue(getCurrentTimeString());
    }
    
   }

  async saveSurgery()
  {
    if(!this.SurgeryForm.touched){
      this.result.emit(null);
      return;
    }
    await this.surgeryService.insertSurgery(this.SurgeryForm.value).then((value:any) =>{
      this.result.emit(value);
    });

  }

 async resetForm()
  {
    this.SurgeryForm.reset();
  }


async updateSurgery(){

  if(!this.SurgeryForm.touched){
    this.result.emit(null);
    return;
  }
  await this.surgeryService.insertSurgery(this.SurgeryForm.value).then((data:any) =>{
    
    if(data.success == 1){


      let surgeonNameForTable;

      let surgeryTypeForTable;

      let surgerySiteForTable;



      surgeonNameForTable = this.surgeons.find(x=> x.SurgeonId == this.SurgeryForm.get("SurgeonId").value);
      surgeryTypeForTable = this.surgeryTypes.find(x=> x.SurgeryTypeId == this.SurgeryForm.get("SurgeryTypeId").value);
      surgerySiteForTable = this.surgerySites.find(x=> x.SurgerySiteId == this.SurgeryForm.get("SurgerySiteId").value);


      let x:SurgeryRecord={
          
          surgeryId : this.SurgeryForm.get("SurgeryId").value,
          date : this.SurgeryForm.get("SurgeryDate").value,
          died : this.SurgeryForm.get("DiedDate").value,
          site : surgerySiteForTable.SurgerySite,
          surgeon : surgeonNameForTable.SurgeonName,
          type : surgeryTypeForTable.SurgeryType,
          anesthesiaMinutes : this.SurgeryForm.get("AnesthesiaMinutes").value,
          antibioticsGiven : this.SurgeryForm.get("AntibioticsGiven").value,
          comments : this.SurgeryForm.get("Comment").value
        }
      console.log(x);
      this.result.emit(x);
      }
  });

}
}
