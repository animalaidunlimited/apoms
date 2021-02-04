import { Component, OnInit, Inject, ChangeDetectorRef } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { User, ReleaseManager } from 'src/app/core/models/user';
import { Observable } from 'rxjs';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { ReleaseService } from 'src/app/core/services/release/release.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';

export interface DialogData {
  emergencyCaseId: number;
  tagNumber: string | undefined;
  patientId: number | undefined;
}

export interface Release {
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
  specificStaff!: boolean;
  isStreetTreatRelease!: boolean;
  isCommented = false;

  recordForm: FormGroup = new FormGroup({});
  releaseManagers: ReleaseManager[] = [];

  username = '';

  constructor(public dialogRef: MatDialogRef<ReleaseDetailsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private userService: UserOptionsService,
    private dropdown: DropdownService,
    private fb: FormBuilder,
    private changeDetector: ChangeDetectorRef,
	  private releaseService: ReleaseService,
    private showSnackBar: SnackbarService) { }

  ngOnInit() {

    this.isInstructionRequired= false;
    this.specificStaff = false;
    this.isStreetTreatRelease = false;

    this.username = this.userService.getUserName();

    this.dropdown.getReleaseManagers().subscribe(managers => {
      this.releaseManagers = managers;
      this.releaseManagers.unshift({FirstName: this.username});
    });

    this.releasers$ = this.dropdown.getRescuers();


    // Record Form
    this.recordForm = this.fb.group({
      releaseId: [],
      emergencyDetails : this.fb.group({
        emergencyCaseId: this.data.emergencyCaseId
      }),
      releaseRequestForm: this.fb.group({
        requestedUser: [this.username, Validators.required],
        requestedDate: [(new Date()).toISOString().substring(0,10), Validators.required]
      }),
      patientId: this.data.patientId,
      complainerNotes: [''],
      complainerInformed:[],
      Releaser1: [],
      Releaser2: [],
    });

    this.initReleaseDetailsForm();

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
    this.isStreetTreatRelease = true;
    this.changeDetector.detectChanges();
  }

  streetTreatReleaseFalse() {
    this.isStreetTreatRelease = false;
    this.changeDetector.detectChanges();
  }

  initReleaseDetailsForm(){

	if(this.data.patientId) {

		this.releaseService.getReleaseDetails(this.data.patientId).subscribe((formVal:any)=> {

      if(formVal?.success === -1){
        this.showSnackBar.errorSnackBar('Error fetching release details status','OK');
        return;
      }

			if(formVal) {
        this.recordForm.patchValue(formVal);

        if(this.recordForm.get('Releaser1')?.value) {
					this.specificStaffTrue();
        }
        if((this.recordForm.get('complainerNotes')?.value)){
					this.isCommented = true;
				}
			}
		});
	}

  }

  onReleaseSubmit(releaseForm:any) {
    this.releaseService.saveRelease(releaseForm.value).then((results:SuccessOnlyResponse[])=>{

      const alreadySaved = results.some((result:SuccessOnlyResponse) => result.success === 2);
        alreadySaved ?
          (
            this.showSnackBar.successSnackBar('Release details has been already saved','OK'),
            this.dialogRef.close(releaseForm.value)
          ) 
          :
          this.showSnackBar.errorSnackBar('Error updating release details','OK');
    
      const failure = results.some((result:SuccessOnlyResponse) => result.success === -1);
        failure ?
            this.showSnackBar.errorSnackBar('Error updating release details','OK')
          :
          (
            this.showSnackBar.successSnackBar('Release details save successfully','OK'),
            this.dialogRef.close(releaseForm.value)
          );

    });

  }

  valueChages(toggle: any , position: number) {
    switch(position) {
      case 2 : {
        if(toggle.checked) {
          this.setRequired('complainerNotes');
          this.recordForm.controls.complainerNotes.updateValueAndValidity();
        }
        else {
          this.setNotRequired('complainerNotes');
          this.recordForm.controls.complainerNotes.updateValueAndValidity();
        }
        break;
      }
      case 3 : {
        if(toggle.checked) {
          this.specificStaffTrue();
        }
        else {
          this.specificStaffFalse();
        }
        break;
      }
      case 4 : {
        if(toggle.checked) {
          this.streetTreatReleaseTrue();
        }
        else {
          this.streetTreatReleaseFalse();
        }
        break;
      }

    }

  }

}
