import { ChangeDetectorRef, Component, Input, Output, OnInit, ViewChild, ChangeDetectionStrategy} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AnimalType } from 'src/app/core/models/animal-type';
import { StreetTreatSearchResponse, StreetTreatSearchVisitsResponse, StreetTreatTab } from 'src/app/core/models/streettreet';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { StreetTreatService } from '../../services/streettreat.service';
import { Priority } from '../../../../core/models/priority';
import { MediaItem } from 'src/app/core/models/media';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { SafeUrl } from '@angular/platform-browser';
import { MatCalendar, MatCalendarCellCssClasses } from '@angular/material/datepicker';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { DatePipe } from '@angular/common';
import { MatTabChangeEvent } from '@angular/material/tabs';

interface VisitCalender{
  status:number;
  date:Date;
}
@Component({
  selector: 'app-streettreat-record',
  templateUrl: './streettreat-record.component.html',
  styleUrls: ['./streettreat-record.component.scss']
})
export class StreetTreatRecordComponent implements OnInit {

  @Input() inputStreetTreatCase!: StreetTreatTab;

  recordForm!: FormGroup;
  animalTypesSubscription: Subscription | undefined;
  animalTypes$: AnimalType[] = [];
  treatmentPrioritySubscription: Subscription | undefined;
  treatmentPriority$: Priority[] = [];
  streetTreatServiceSubscription: Subscription | undefined;
  visitDates: VisitCalender[] = [];
  profileUrl: SafeUrl = '';
  dateSelected: string[]=[];
  mediaData!: BehaviorSubject<MediaItem[]>;
  loadCalendarComponent = true;
  

  constructor(
    private fb: FormBuilder,
    private streetTreatService: StreetTreatService,
    private dropdown: DropdownService,
    private patientService: PatientService,
    private changeDetector: ChangeDetectorRef,
    private showSnackBar: SnackbarService,
    private datePipe: DatePipe,
  ) { }

  public get emergencyCaseId() {
    return this.inputStreetTreatCase.emergencyCaseId;
  }

  public get patientId() {
    return this.inputStreetTreatCase.patientId as number;
  }

  public get streetTreatFrom(){
    return this.recordForm.value;
  }
  @ViewChild(MatCalendar)
  calendar!: MatCalendar<Date>;
  ngOnInit(): void {
    this.recordForm = this.fb.group({
      EmergencyNumber: ['', Validators.required],
      TagNumber: ['', Validators.required],
      NextVisit: [''],
      PercentComplete: ['', Validators.required],
      AnimalTypeId: ['', Validators.required],
      AnimalName:[''],
      BeginDate:[{value: '', disabled: true}, Validators.required],
      EndDate:[],
      EarlyReleaseFlag:[],
      IsIsolation:[],
      PriorityId: ['', Validators.required],
      emergencyDetails: this.fb.group({
        emergencyCaseId: [this.emergencyCaseId, Validators.required]
      }),
      patientDetails: this.fb.group(
        {
          tagNumber: [this.inputStreetTreatCase.value,Validators.required],
          patientId: [this.inputStreetTreatCase.patientId,Validators.required],
          currentLocation: this.inputStreetTreatCase.currentLocation
        }
      ),
      patientId:[this.patientId,Validators.required],
    });
    this.mediaData = this.patientService.getPatientMediaItemsByPatientId(this.patientId);

    if (this.mediaData) {
      this.mediaData.subscribe(media => {
        if (media.length === 0) {
          return;
        }
        this.profileUrl = media.find(item => Boolean(item.isPrimary) === true)?.remoteURL || media[0].remoteURL || '../../../../../../assets/images/image_placeholder.png';
        this.changeDetector.detectChanges();
      });
    }

    this.animalTypesSubscription = this.dropdown.getAnimalTypes().subscribe(animalTypes => {
      this.animalTypes$ = animalTypes;
      this.animalTypesSubscription?.unsubscribe();
    });

    this.treatmentPrioritySubscription = this.dropdown.getPriority().subscribe(treatmentPriority => {
      this.treatmentPriority$ = treatmentPriority;
      this.treatmentPrioritySubscription?.unsubscribe();
    });

    this.streetTreatServiceSubscription = this.streetTreatService.getStreetTreatCaseById(this.inputStreetTreatCase.streetTreatCaseId).subscribe((res) => {
      this.recordForm.patchValue(res);
      this.streetTreatServiceSubscription?.unsubscribe();
    });

    this.streetTreatServiceSubscription = this.streetTreatService.getVisitDatesByStreetTreatCaseId(this.inputStreetTreatCase.streetTreatCaseId)
    .subscribe((visitResponse:StreetTreatSearchVisitsResponse[])=>{
      visitResponse.map((visitResponseVal)=> {
        this.visitDates.push(
        {
          status: visitResponseVal.StatusId,
          date:visitResponseVal.Date
        }
        );
      });
      this.streetTreatServiceSubscription?.unsubscribe();
    });
    setTimeout(()=>this.recordForm.get('streatTreatForm.streetTreatCaseStatus')?.valueChanges.subscribe((casePriority)=> {
      if(casePriority > 3)
      {
        this.recordForm.get('EndDate')?.setValidators([Validators.required]);
        this.recordForm.get('EndDate')?.updateValueAndValidity();
        this.recordForm.get('EndDate')?.markAsTouched();
      }
      else{
        this.recordForm.get('EndDate')?.clearValidators();
        this.recordForm.get('EndDate')?.updateValueAndValidity();
      }
    }),100);
    
  }
  dateSelectedEventHandler($event:any){
    
    this.dateSelected = [...$event];

    if(this.calendar) {
      this.calendar.updateTodaysDate(); 
    } 
  }
  loadCalendar(){
    this.loadCalendarComponent = !this.loadCalendarComponent;
  }
  
  onSelect(selectedDate:Date)
  {
  
    const date = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString().substring(0,10);
    const index = this.dateSelected.findIndex(x => x === date);
    if (index < 0) {
      this.dateSelected = [...this.dateSelected, date];
    }
    else {
      this.dateSelected.splice(index, 1);
      this.dateSelected = this.dateSelected.slice();
    }
    this.changeDetector.detectChanges();
    this.calendar.updateTodaysDate(); 
  } 

  saveForm(){
    this.streetTreatService.saveStreetTreatForm(this.streetTreatFrom).then(response => {

      response.success === 1
          ? this.showSnackBar.successSnackBar('Street Treat updated successfully','OK')
          : this.showSnackBar.errorSnackBar('Error updating Street Treat','OK');

      if(response?.success === -1){
        this.showSnackBar.errorSnackBar('Error updating Street Treat','OK');
        return;
      }

    });
 
  }

  dateClass() {
    return (date: Date): MatCalendarCellCssClasses  => {
    let calenderCSS = '';
    for(const visit of this.visitDates){
      const d = new Date(visit.date);
      if(
        new Date(d).toDateString() === new Date(date).toDateString() 
      )
      {
          if(visit.status === 1)
          {
            calenderCSS ='to-do';
          }
          else if(visit.status === 2) {
            calenderCSS ='in-progress';
          }
          else if(visit.status === 3) {
            calenderCSS ='missed';
          }
          else if(visit.status === 4){
            calenderCSS ='complete';
          }
          else if(visit.status === 5){
            calenderCSS ='complete-early-release';
          }
          else if(visit.status === 6){
            calenderCSS ='complete-animal-died';
          }
          else if(visit.status === 7){
            calenderCSS ='complete-animal-not-found';
          }
          else if(visit.status === 8){
            calenderCSS ='readmission';
          }
      }
    }
    if(this.dateSelected.length > 0)
    {        
      

      const highlightDate = this.dateSelected.map(calenderSelectedDate => new Date(calenderSelectedDate))
      .some(
        currentCalenderSelectedDate => 
          new Date(currentCalenderSelectedDate).toDateString() === new Date(date).toDateString() &&
          !this.visitDates.find(x=> new Date(x.date).toDateString() === new Date(date).toDateString())
      );
      if(highlightDate)
      { 
      calenderCSS = 'selected-date';
      }
    }
    return  calenderCSS ? calenderCSS : '';
    };
  }
}
