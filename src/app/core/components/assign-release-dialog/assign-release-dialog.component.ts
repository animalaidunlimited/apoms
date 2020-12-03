import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { OutstandingAssignment } from '../../models/outstanding-case';
import { ReleaseDetails } from '../../models/release';

interface IncomingCaseDetails {
  caseDetails: OutstandingAssignment;
}

@Component({
  selector: 'app-assign-release-dialog',
  templateUrl: './assign-release-dialog.component.html',
  styleUrls: ['./assign-release-dialog.component.scss']
})
export class AssignReleaseDialogComponent implements OnInit {

  formData!: ReleaseDetails;

  constructor(public dialogRef: MatDialogRef<AssignReleaseDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IncomingCaseDetails) { }

  ngOnInit() {

    this.formData = {
      releaseId: this.data.caseDetails.releaseId,
      emergencyCaseId: this.data.caseDetails.emergencyCaseId,
      // releaseRequestForm : {
      //  requestedUser: this.data.caseDetails.requestedUser,
      //  requestedDate: this.data.caseDetails.requestedDate,
      // },
      releaseType: this.data.caseDetails.releaseTypeId,
      // complainerNotes: this.data.caseDetails.complainerNotes,
      // complianerInformed: this.data.caseDetails.complainerInformed,
      Releaser1: this.data.caseDetails.staff1,
      Releaser2: this.data.caseDetails.staff2,
      // callerDetails: {
      //  callerId: this.data.caseDetails.callerId
      // },
      pickupDate: this.data.caseDetails.pickupDate,
      releaseBeginDate: this.data.caseDetails.releaseBeginDate,
      releaseEndDate: this.data.caseDetails.releaseEndDate

    };

  }

  onSaveResponse(result:any){
    if(result > 0){
      this.dialogRef.close();
    }
  }

}
