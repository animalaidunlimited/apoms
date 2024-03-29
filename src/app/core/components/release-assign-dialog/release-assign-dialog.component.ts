import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OutstandingAssignment } from '../../models/outstanding-case';
import { ReleaseDetails } from '../../models/release';

interface IncomingCaseDetails {
  caseDetails: OutstandingAssignment;
}

@Component({
  selector: 'app-release-assign-dialog',
  templateUrl: './release-assign-dialog.component.html',
  styleUrls: ['./release-assign-dialog.component.scss']
})
export class ReleaseAssignDialogComponent implements OnInit {

  formData!: ReleaseDetails;
  formInvalid = false;

  constructor(public MatDialogRef: MatDialogRef<ReleaseAssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IncomingCaseDetails) { }


  ngOnInit() {

    this.formData = {
      releaseId: this.data.caseDetails.releaseDetailsId,
      emergencyCaseId: this.data.caseDetails.emergencyCaseId,
      // tslint:disable-next-line: no-non-null-assertion
      releaseType: this.data.caseDetails.releaseType!,
      releaseAmbulanceId: this.data.caseDetails.releaseAmbulanceId as number,
      ambulanceAssignmentTime: this.data.caseDetails.ambulanceAssignmentTime,
      pickupDate: this.data.caseDetails.releasePickupDate as string,
      releaseBeginDate: this.data.caseDetails.releaseBeginDate as string,
      releaseEndDate: this.data.caseDetails.releaseEndDate as string,
      assignedVehicleId: 0 as number
    };

  }

  setFormValidity($event: boolean){
    this.formInvalid = $event;
  }

  onSaveResponse(result:any){
    if(result > 0){
      this.MatDialogRef.close();
    }
  }

  closeDialog(){
    this.MatDialogRef.close();
  }

}
