import { Component, OnInit, Input, EventEmitter, Output, OnDestroy } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { User } from '../../models/user';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReleaseService } from '../../services/release/release.service';
import { getCurrentTimeString } from '../../helpers/utils';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { ReleaseDetails } from '../../models/release';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-release-assign',
  templateUrl: './release-assign.component.html',
  styleUrls: ['./release-assign.component.scss']
})
export class ReleaseAssignComponent implements OnInit, OnDestroy {

  @Input() formData: ReleaseDetails | undefined;
  @Input() patientId: number | undefined;
  @Output() public saveSuccessResponse = new EventEmitter<number>();

  recordForm!: FormGroup;
  releasers$!: Observable<User[]>;

  private ngUnsubscribe = new Subject();

  constructor(private dropdown: DropdownService,
    private fb: FormBuilder,
    private releaseDetails: ReleaseService,
    private showSnackBar: SnackbarService
	) { }

  ngOnInit() {

    this.releasers$ = this.dropdown.getRescuers();

    this.recordForm = this.fb.group({
      releaseId: [],
      emergencyCaseId:[],
      releaseType: [{value: '', disabled: true}],
      Releaser1: [],
      Releaser2: [],
      releaseBeginDate: [],
      releaseEndDate: [],
      pickupDate: []
    });

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
