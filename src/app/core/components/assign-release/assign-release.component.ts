import { Component, OnInit, Input, ɵCodegenComponentFactoryResolver } from '@angular/core';
import { Observable } from 'rxjs';
import { User } from '../../models/user';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReleaseService } from '../../services/release/release.service';
import { getCurrentTimeString } from '../../helpers/utils';

@Component({
  selector: 'app-assign-release',
  templateUrl: './assign-release.component.html',
  styleUrls: ['./assign-release.component.scss']
})
export class AssignReleaseComponent implements OnInit {

  releasers$!: Observable<User[]>;

  recordForm!: FormGroup;

  @Input() formData!: any;

  constructor(private dropdown: DropdownService,
    private fb: FormBuilder,
    private releaseDetails: ReleaseService) { }

  ngOnInit() {
    this.releasers$ = this.dropdown.getRescuers();

    this.recordForm = this.fb.group({
      releaseId: [],
      releaseType: [],
      complainerNotes: [''],
      complainerInformed:[],
      Releaser1: [],
      Releaser2: [],
      releaseBeginDate: [],
      releaseEndDate: [],
      releaseRequestForm: this.fb.group({
        requestedUser:[],
        requestedDate: []
      }),
      callerDetails: this.fb.group({
        callerId : []
      })
    });

    this.recordForm.patchValue(this.formData);
    console.log(this.recordForm.value);

  }

  setInitialTime(event: FocusEvent) {
    let currentTime;
    currentTime = this.recordForm.get((event.target as HTMLInputElement).name)?.value;

    console.log(currentTime);

    if (!currentTime) {

        const target = this.recordForm.get((event.target as HTMLInputElement).name);

        if(target){
            target.setValue(getCurrentTimeString());
        }

    }
}

  saveReleaseDetails() {
    this.releaseDetails.saveRelease(this.recordForm.value);
  }

}
