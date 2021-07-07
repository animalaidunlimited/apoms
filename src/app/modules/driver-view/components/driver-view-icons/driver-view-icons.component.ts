import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DriverAssignments } from 'src/app/core/models/driver-view';
import { CallerDetailsDialogComponent } from '../../dialogs/caller-details-dialog/caller-details-dialog.component';

@Component({
  selector: 'app-driver-view-icons',
  templateUrl: './driver-view-icons.component.html',
  styleUrls: ['./driver-view-icons.component.scss']
})
export class DriverViewIconsComponent implements OnInit {

  @Input() driverViewAssignment!: DriverAssignments;

  displayIconsDiv = false;

  constructor(private dialog: MatDialog) { }

  ngOnInit(): void {

    console.log(this.driverViewAssignment)
    

  }

  openCallerDetailsDialog(assignment: DriverAssignments) {
    const dialogRef = this.dialog.open(CallerDetailsDialogComponent, {
      width: '100vw',
      data: {emergencyCaseId: assignment.emergencyCaseId}
    });
  }

}
