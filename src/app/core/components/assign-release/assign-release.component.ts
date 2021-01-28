import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReleaseService } from '../../services/release/release.service';
import { getCurrentTimeString } from '../../helpers/utils';
import { Release } from 'src/app/modules/hospital-manager/components/release-details-dialog/release-details-dialog.component';
import { SnackbarService } from '../../services/snackbar/snackbar.service';
import { ReleaseDetails } from '../../models/release';


@Component({
  selector: 'app-assign-release',
  templateUrl: './assign-release.component.html',
  styleUrls: ['./assign-release.component.scss']
})
export class AssignReleaseComponent implements OnInit {

  releasers$!: Observable<User[]>;

  recordForm!: FormGroup;

  @Input() formData!: ReleaseDetails;
  @Output() public saveSuccessResponse = new EventEmitter<number>();
  releaseTypes:Release[] = [
  {id:1, type: 'Normal release'},
  {id:2, type:'Normal + Complainer special instructions'},
  {id:3, type:'Specific staff for release'},
  {id:4, type:'StreetTreat release'}];

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
      releaseType: [{value: null, disabled: true}],
      Releaser1: [],
      Releaser2: [],
      releaseBeginDate: [],
      releaseEndDate: [],
      pickupDate: [],
    });

    this.recordForm.patchValue(this.formData);

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
