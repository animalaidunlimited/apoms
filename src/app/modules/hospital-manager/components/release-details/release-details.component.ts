import { ChangeDetectorRef, Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { Observable } from 'rxjs';
import { ReleaseManager, User } from 'src/app/core/models/user';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { take } from 'rxjs/operators';
import { ReleaseService } from 'src/app/core/services/release/release.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';

export interface Release {
  id: number;
  type: string;
}

@Component({
  selector: 'app-release-details',
  templateUrl: './release-details.component.html',
  styleUrls: ['./release-details.component.scss'],
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
export class ReleaseDetailsComponent implements OnInit {

  @Input() patientId!: number;
  @Input() emergencyCaseId!: number;
  @Output() formValidity = new EventEmitter<boolean>(false);

  isInstructionRequired!: boolean;

  isStreetTreatRelease!: boolean;
  isCommented = false;

  recordForm: FormGroup = new FormGroup({});

  releasers$!:Observable<User[]>;
  specificStaff!: boolean;

  releaseManagers: ReleaseManager[] = [];

  username = '';

  constructor(
    private fb: FormBuilder,
    private showSnackBar: SnackbarService,
    private userService: UserOptionsService,
    private releaseService: ReleaseService,
    private changeDetector: ChangeDetectorRef,
    private dropdown: DropdownService
  ) { }

  ngOnInit(): void {

    this.username = this.userService.getUserName();

    this.dropdown.getReleaseManagers().pipe(take(1)).subscribe(managers => {
      this.releaseManagers = managers;
      this.releaseManagers.unshift({FirstName: this.username});
    });

    this.specificStaff = false;
    this.releasers$ = this.dropdown.getRescuers();

    this.isInstructionRequired= false;

    this.isStreetTreatRelease = false;

    // Record Form
    this.recordForm = this.fb.group({
      releaseId: [],
      emergencyDetails : this.fb.group({
        emergencyCaseId: this.emergencyCaseId
      }),
      releaseRequestForm: this.fb.group({
        requestedUser: [this.username, Validators.required],
        requestedDate: [(new Date()).toISOString().substring(0,10), Validators.required]
      }),
      patientId: this.patientId,
      complainerNotes: [''],
      complainerInformed:[],
      Releaser1: [],
      Releaser2: []
    });

    this.initReleaseDetailsForm();

    
    this.recordForm.statusChanges.subscribe(status => {
      
      setTimeout(() => this.formValidity.next(this.recordForm.status === 'VALID' ? false : true),1);
    
    });

  }

  initReleaseDetailsForm(){

    if(this.patientId) {

      this.releaseService.getReleaseDetails(this.patientId).pipe(take(1)).subscribe((formVal:any)=> {

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

  streetTreatCaseIdEventHandler(streetTreatCaseId:number){

    if(streetTreatCaseId)
    {
      this.streetTreatReleaseTrue();
    }
  }

  setRequired(name: string) {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    this.recordForm.controls[name]?.setValidators(Validators.required);

    // eslint-disable-next-line @typescript-eslint/dot-notation
    this.recordForm.controls[name].updateValueAndValidity();
  }

  setNotRequired(name: string) {
    // eslint-disable-next-line @typescript-eslint/dot-notation
    this.recordForm.controls[name].clearValidators();
    // eslint-disable-next-line @typescript-eslint/dot-notation
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
          this.changeDetector.detectChanges();
        }
        else {
          this.streetTreatReleaseFalse();
          this.changeDetector.detectChanges();

        }
        break;
      }

    }

  }

  onReleaseSubmit() {

    this.releaseService.saveRelease(this.recordForm.value).then((results:SuccessOnlyResponse[]) => {

      const failure = results.some((result:SuccessOnlyResponse) => result.success === -1);

      if(failure){
        this.showSnackBar.errorSnackBar('Error updating release details','OK');
      }
      else
      {
        this.showSnackBar.successSnackBar('Release details save successfully','OK');
      }

    });

  }

}
