import { ChangeDetectorRef, Component, Input, OnInit} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { AnimalType } from 'src/app/core/models/animal-type';
import { StreetTreatTab } from 'src/app/core/models/streettreet';

import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { StreetTreatService } from '../../services/streettreat.service';
import { MediaItem } from 'src/app/core/models/media';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { SafeUrl } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { map, take, takeUntil } from 'rxjs/operators';
import { Vehicle } from 'src/app/core/models/driver-view';



@Component({
  selector: 'app-streettreat-record',
  templateUrl: './streettreat-record.component.html',
  styleUrls: ['./streettreat-record.component.scss']
})
export class StreetTreatRecordComponent implements OnInit {

  vehicleList$!: Observable<Vehicle[]>

  permissionType!: number[];

  private ngUnsubscribe = new Subject();

  hasWritePermission = false;

  @Input() inputStreetTreatCase!: StreetTreatTab;

  recordForm!: FormGroup;
  animalTypes$!: Observable<AnimalType[]>;
  streetTreatServiceSubscription: Subscription | undefined;


  profileUrl: SafeUrl = '../../../../../../assets/images/image_placeholder.png';
  dateSelected: string[]=[];
  mediaData!: BehaviorSubject<MediaItem[]>;

  constructor(
    private fb: FormBuilder,
    private streetTreatService: StreetTreatService,
    private dropdown: DropdownService,
    private patientService: PatientService,
    private changeDetector: ChangeDetectorRef,
    private showSnackBar: SnackbarService,
    private route : ActivatedRoute
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

  ngOnInit(): void {

    this.vehicleList$ = this.dropdown.getVehicleListDropdown();

    this.route.data.pipe(takeUntil(this.ngUnsubscribe)).subscribe(val=> {
      if (val.componentPermissionLevel.value === 2) {
          this.hasWritePermission = true;
      }

    });

    this.recordForm = this.fb.group({
      EmergencyNumber: [{value: '', disabled: true}, Validators.required],
      TagNumber: [{value: '', disabled: true}, Validators.required],
      NextVisit: [{value: '', disabled: true}],
      PercentComplete: [{value: '', disabled: true}, Validators.required],
      AnimalTypeId: [''],
      AnimalName:[''],
      BeginDate:[{value: '', disabled: true}, Validators.required],
      EndDate:[],
      EarlyReleaseFlag:[],
      IsIsolation:[],
      PriorityId: [''],
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
      // assignedVehicleId: [],
      // assignedDate:['']

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

    this.animalTypes$ = this.dropdown.getAnimalTypes();

    console.log(this.inputStreetTreatCase);
    this.streetTreatServiceSubscription = this.streetTreatService.getStreetTreatCaseById(this.inputStreetTreatCase.streetTreatCaseId)
    .pipe(
      map(item => {

        item.PercentComplete = item.PercentComplete * 100;

        return item;
    } ),
      take(1))
    .subscribe((res) => {
      this.recordForm.patchValue(res);

      this.streetTreatServiceSubscription?.unsubscribe();
    });


    setTimeout(() => this.recordForm.get('streatTreatForm.streetTreatCaseStatus')?.valueChanges.subscribe((casePriority)=> {
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


  saveForm(){

    if(this.hasWritePermission) {
     this.streetTreatService.saveStreetTreatForm(this.streetTreatFrom).then(response => {
       if(response.success === 1)
         {
           this.showSnackBar.successSnackBar('Street Treat updated successfully','OK');
           this.streetTreatService.getStreetTreatWithVisitDetailsByPatientId(this.patientId)
           .pipe(takeUntil(this.ngUnsubscribe))
           .subscribe((response) => {
             this.recordForm.get('streatTreatForm.visits')?.patchValue(response.visits);
           });

         }
         else {
           this.showSnackBar.errorSnackBar('Error updating Street Treat','OK');
         }

       if(response?.success === -1){
         this.showSnackBar.errorSnackBar('Error updating Street Treat','OK');
         return;
       }

     });
    }
    else {
      this.showSnackBar.errorSnackBar('You do not have permission to save; please see the admin' , 'OK');
    }
   }

}
