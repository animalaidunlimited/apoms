import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User, ReleaseManager } from 'src/app/core/models/user';
import { Observable } from 'rxjs';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { MatSelectChange } from '@angular/material/select';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { CallerDetailsComponent } from 'src/app/core/components/caller-details/caller-details.component';
import { ReleaseService } from 'src/app/core/services/release/release.service';

export interface DialogData {
  emergencyCaseId: number;
  tagNumber: string | undefined;
  patientId: number | undefined;
}

interface Release {
  id: number;
  type: string;
}

@Component({
  selector: 'app-release-details-dialog',
  templateUrl: './release-details-dialog.component.html',
  styleUrls: ['./release-details-dialog.component.scss'],
  animations: [
    trigger('openCloseDiv', [
      state('false', style({
        width: '0px',
        height: '0px',
        visibility: 'hidden'
      })),
      state('true',
       style({
        backgroundColor: '',
        width: 'auto',
        height: 'auto',
        visibility: 'visible'
      })),
      transition('true => false', [animate('250ms 750ms')]),
      transition('false => true', [animate('250ms')])
    ]),

    trigger('visibilityDiv', [
      state('false' , style({ opacity: 0 })),
      state('true', style({ opacity: 1})),
      transition('false <=> true', [animate('500ms 250ms')])
    ])

  ]
})
export class ReleaseDetailsDialogComponent implements OnInit {

  isInstructionRequired!: boolean;
  releasers$!:Observable<User[]>;
  releaseManagers$!: Observable<ReleaseManager[]>;
  specificStaff!: boolean;
  isStreatTreatRelease!: boolean;
  incomingFormData!: Observable<any>;

  recordForm: FormGroup = new FormGroup({});

  releaseTypes:Release[] = [{id:1 , type: 'Normal release'},
  {id:2 , type:'Normal + Complainer special instructions'},
  {id:3 , type:'Specific staff for release'},
  {id:4, type:'StreetTreat release'},
  {id:5 , type: 'Normal release + StreetTreat release'}];

  constructor(public dialogRef: MatDialogRef<ReleaseDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private dropdown: DropdownService,
    private fb: FormBuilder,
    private releaseService: ReleaseService) { }

  ngOnInit() {

    this.isInstructionRequired= false;
    this.specificStaff = false;
    this.isStreatTreatRelease = false;

    this.releasers$ = this.dropdown.getRescuers();


    // Record Form
    this.recordForm = this.fb.group({

      releaseId: [],

      emergencyDetails : this.fb.group({
        emergencyCaseId: this.data.emergencyCaseId
      }),

      patientId: this.data.patientId,
      releaseType: [,Validators.required],
      complainerNotes: [''],
      complainerInformed:[],
      Releaser1: [],
      Releaser2: [],
      pickupdate: [],
      releaseBeginDate: [],
      releaseEndDate: []

    });

    if(this.data.patientId) {
      
      //  CHECK IF RELEASE ALREADY EXISTS AND PATCH IT TO THE FORM.
      this.incomingFormData = this.releaseService.getReleaseDetails(this.data.patientId);
      this.incomingFormData.subscribe((formVal: any)=>{
        if(formVal) {
          this.recordForm.patchValue(formVal);
          if(this.recordForm.get('releaseType')?.value===3) {
            this.specificStaffTrue();
          }
        }
      });

    }

  }

  valueChanged(releaseType: MatSelectChange) {

    switch(releaseType.value) {
      case 2 : {
        this.setRequired('complainerNotes');
        this.streetTreatReleaseFalse();
        this.specificStaffFalse();
        break;
      }
      case 3 : {

        this.specificStaffTrue();
        this.streetTreatReleaseFalse();
        this.setNotRequired('complainerNotes');
        break;
      }
      case 4 : {
        this.streetTreatReleaseTrue();
        this.setNotRequired('complainerNotes');
        this.specificStaffFalse();
        break;
      }
      default : {
        this.setNotRequired('complainerNotes');
        this.streetTreatReleaseFalse();
        this.specificStaffFalse();
        break;
      }
    }
  }

  setRequired(name: string) {
    // tslint:disable-next-line:no-string-literal
    this.recordForm.controls[name]?.setValidators(Validators.required);

    // tslint:disable-next-line:no-string-literal
    this.recordForm.controls[name].updateValueAndValidity();
  }

  setNotRequired(name: string) {
    // tslint:disable-next-line:no-string-literal
    this.recordForm.controls[name].clearValidators();
    // tslint:disable-next-line:no-string-literal      
    this.recordForm.controls[name].updateValueAndValidity();
  }


  specificStaffTrue() {
    this.specificStaff = true;
    this.setRequired('Releaser1');
  }

  specificStaffFalse() {
    this.specificStaff = false;
    this.setNotRequired('Releaser1');
  }

  streetTreatReleaseTrue() {
    this.isStreatTreatRelease = true;
  }

  streetTreatReleaseFalse() {
    this.isStreatTreatRelease = false;
  }
  

  onReleaseSubmit(releaseForm:any) {
    console.log(releaseForm.value);
    this.releaseService.saveRelease(releaseForm.value);
  }


}
