import { Component, OnInit, Input } from '@angular/core';
import { CrossFieldErrorMatcher } from '../../validators/cross-field-error-matcher';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { DatePipe } from '@angular/common';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';
import { UserOptionsService } from '../../services/user-options.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, Validators } from '@angular/forms';
import { Patient } from '../../models/patients';
import { getCurrentTimeString } from '../../utils';

@Component({
  selector: 'patient-status',
  templateUrl: './patient-status.component.html',
  styleUrls: ['./patient-status.component.scss']
})
export class PatientStatusComponent implements OnInit {

  errorMatcher = new CrossFieldErrorMatcher();
  patientStates$;
  @Input() patientId:number;

  constructor(
    private dropdowns: DropdownService,
    private datepipe: DatePipe,
    private patientService: PatientService,
    private userOptions: UserOptionsService,
    private _snackBar: MatSnackBar,
    private fb: FormBuilder
    ) {}



    patientStatusForm;
    currentTime;
    tagNumber;
    createdDate;

    notificationDurationSeconds;

    ngOnInit() {

      this.notificationDurationSeconds = this.userOptions.getNotifactionDuration();

      this.patientStatusForm = this.fb.group({
        patientId: [this.patientId, Validators.required],
        tagNumber: ["", Validators.required],
        createdDate: ["", Validators.required],
        patientStatusId: ["", Validators.required],
        patientStatusDate: ["", Validators.required],
        PN: [""],
        suspectedRabies: [false]
      });

      this.patientStates$ = this.dropdowns.getPatientStates();

      this.patientService.getPatientByPatientId(this.patientStatusForm.get("patientId").value)
      .subscribe((patient: Patient) => {

        this.patientStatusForm.patchValue(patient);
        this.tagNumber = this.patientStatusForm.get("tagNumber").value;
        this.createdDate = this.patientStatusForm.get("createdDate").value;
      });

      this.currentTime = getCurrentTimeString();

    }

    onSave(){

      this.patientService.updatePatientStatus(this.patientStatusForm.value)
      .then((result) => {
            //Add this to the messaging service

            result.success == 1 ?
              this.openSnackBar("Patient status updated successfully", "OK")
              :
              this.openSnackBar("Error updating patient status", "OK");

      });
    }

    onStatusChange(){

      //Empty out the values associated with a deceased patient if the patient hasn't died
      if(this.patientStatusForm.get("patientStatusId").value != 3){
        this.patientStatusForm.get("PN").setValue(null);
        this.patientStatusForm.get("suspectedRabies").setValue(null);
      }
    }

    setDate(){

      let date = this.datepipe.transform(new Date(), 'yyyy-MM-dd');
      this.patientStatusForm.get("patientStatusDate").setValue(date);

    }

    openSnackBar(message: string, action: string) {
      this._snackBar.open(message, action, {
        duration: this.notificationDurationSeconds * 1000,
      });
    }

}
