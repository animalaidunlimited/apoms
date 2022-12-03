import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DriverAssignment } from 'src/app/core/models/driver-view';
import { CallerDetailsDialogComponent } from '../../dialogs/caller-details-dialog/caller-details-dialog.component';
import { LocationDialogComponent } from '../../dialogs/location-dialog/location-dialog.component';
import { PatientSelectForMediaDialogComponent } from '../../dialogs/patient-select-for-media-dialog/patient-select-for-media-dialog.component';

@Component({
  selector: 'app-driver-view-icons',
  templateUrl: './driver-view-icons.component.html',
  styleUrls: ['./driver-view-icons.component.scss']
})
export class DriverViewIconsComponent implements OnInit {

  @Input() driverViewAssignment!: DriverAssignment;

  displayIconsDiv = false;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {
    

  }

  openCallerDetailsDialog(assignment: DriverAssignment) {
    const dialogRef = this.dialog.open(CallerDetailsDialogComponent, {
      disableClose:true,
      minWidth: '100vw',
      data: {assignmentDetails: assignment}
    });
  }

  openLocationDialog(assignment: DriverAssignment) {
    const dialogRef = this.dialog.open(LocationDialogComponent, {
      disableClose:true,
      minWidth: '100vw',
      data: {assignmentDetails: assignment}
    });
  }

  openPatientSelectForMediaDialog(assignment: DriverAssignment) {
    const dialogRef = this.dialog.open(PatientSelectForMediaDialogComponent, {
      disableClose:true,
      minWidth: '100vw',
      data: {assignmentDetails: assignment}
    });
  }

}
