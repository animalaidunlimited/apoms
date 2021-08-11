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

  constructor(public dialogRef: MatDialogRef<ReleaseAssignDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IncomingCaseDetails) { }


  ngOnInit() {

    this.formData = {
      releaseId: this.data.caseDetails.releaseDetailsId,
      emergencyCaseId: this.data.caseDetails.emergencyCaseId,
      releaseType: this.data.caseDetails.releaseType,
 
      assignedVehicleId: this.data.caseDetails.assignedVehicleId as number,
      ambulanceAssignmentTime: this.data.caseDetails.ambulanceAssignmentTime,
      pickupDate: this.data.caseDetails.releasePickupDate as string,
      releaseBeginDate: this.data.caseDetails.releaseBeginDate as string,
      releaseEndDate: this.data.caseDetails.releaseEndDate as string
    };

  }

  setFormValidity($event: boolean){
    this.formInvalid = $event;
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
