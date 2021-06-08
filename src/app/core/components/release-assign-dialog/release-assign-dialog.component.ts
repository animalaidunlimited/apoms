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

  constructor(public dialogRef: MatDialogRef<ReleaseAssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IncomingCaseDetails) { }


  ngOnInit() {

    this.formData = {
      releaseId: this.data.caseDetails.releaseId,
      emergencyCaseId: this.data.caseDetails.emergencyCaseId,
      releaseType: this.data.caseDetails.releaseType,
      Releaser1: this.data.caseDetails.staff1,
      Releaser2: this.data.caseDetails.staff2,
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

  closeDialog(){
    this.dialogRef.close();
  }

}
