import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { User } from '../../models/user';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReleaseService } from '../../services/release/release.service';
import { getCurrentTimeString } from '../../helpers/utils';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { ReleaseDetails } from '../../models/release';
import { takeUntil } from 'rxjs/operators';
import { Vehicle } from '../../models/driver-view';
import { MatSelectChange } from '@angular/material/select';
import { CrossFieldErrorMatcher } from '../../validators/cross-field-error-matcher';

@Component({
  selector: 'app-release-assign',
  templateUrl: './release-assign.component.html',
  styleUrls: ['./release-assign.component.scss']
})
export class ReleaseAssignComponent implements OnInit, OnDestroy {

  @Input() formData: ReleaseDetails | undefined;
  @Input() patientId: number | undefined;
  @Output() public saveSuccessResponse = new EventEmitter<number>();
  @Output() public formInvalid = new EventEmitter<boolean>(false);

  errorMatcher = new CrossFieldErrorMatcher();

  recordForm!: FormGroup;
  releasers$!: Observable<User[]>;
  vehicleList$!: Observable<Vehicle[]>

  private ngUnsubscribe = new Subject();

  constructor(private dropdown: DropdownService,
    private fb: FormBuilder,
    private releaseDetails: ReleaseService,
    private showSnackBar: SnackbarService
	) { }

  ngOnInit() {

    this.releasers$ = this.dropdown.getRescuers();
    this.vehicleList$ = this.dropdown.getVehicleListDropdown();

    this.recordForm = this.fb.group({
      releaseId: [],
      emergencyCaseId:[],
      releaseType: [{value: '', disabled: true}],
      Releaser1: [],
      Releaser2: [],
      releaseBeginDate: [],
      releaseEndDate: [],
      pickupDate: [],
      assignedVehicleId:[],
      ambulanceAssignmentTime:[]
    });

    this.recordForm.get('ambulanceAssignmentTime')?.valueChanges.subscribe(() => {

      this.formInvalid.emit(this.recordForm.get('ambulanceAssignmentTime')?.invalid);

    });

    console.log(this.formData);

    if(!this.formData){

      this.releaseDetails.getReleaseDetails(this.patientId || -1)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(release => {
          this.formData = release as ReleaseDetails;

          this.recordForm.patchValue(this.formData);
      });

    }
    else {

      this.recordForm.patchValue(this.formData);

    }

  }

  ngOnDestroy(){
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  setInitialDate(event: FocusEvent) {
    let currentTime;
    currentTime = this.recordForm.get((event.target as HTMLInputElement).name)?.value;

    if (!currentTime) {

        const target = this.recordForm.get((event.target as HTMLInputElement).name);

        if(target){
            target.setValue(getCurrentTimeString());
        }

    }
}

vehicleSelected($event:MatSelectChange){

  const ambulanceAssignmentTime = this.recordForm.get('ambulanceAssignmentTime')

  if($event.value)  {
        ambulanceAssignmentTime?.setValidators([Validators.required]);
      }
      else  {
        ambulanceAssignmentTime?.clearValidators();
      }

      ambulanceAssignmentTime?.updateValueAndValidity();
      this.formInvalid.emit(this.recordForm.get('ambulanceAssignmentTime')?.invalid);

}

  saveReleaseDetails() {

    this.releaseDetails.saveRelease(this.recordForm.getRawValue()).then((response: any)=>{

      if(response?.success === -1){
        this.showSnackBar.errorSnackBar('Error updating patient status','OK');
        return;
      }

      response.success === 1
                      ? this.showSnackBar.successSnackBar('Patient status updated successfully','OK')
                      : this.showSnackBar.errorSnackBar('Error updating patient status','OK');

      this.saveSuccessResponse.emit(response.success);

    });
  }
}
