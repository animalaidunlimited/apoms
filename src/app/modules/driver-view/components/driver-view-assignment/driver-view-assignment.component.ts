import { analyzeAndValidateNgModules } from '@angular/compiler';
import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormControlName, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { DriverAssignments } from 'src/app/core/models/driver-view';
import { DriverActionDialogComponent } from '../../dialogs/driver-action-dialog/driver-action-dialog.component';
import { DriverViewService } from '../../services/driver-view.service';

@Component({
  selector: 'app-driver-view-assignment',
  templateUrl: './driver-view-assignment.component.html',
  styleUrls: ['./driver-view-assignment.component.scss']
})
export class DriverViewAssignmentComponent implements OnInit {

  @Input() actionStatus!: string;
  @Input() showCompleteFlag!: any;
  driverViewAssignments!: Observable<DriverAssignments[]>; 


  constructor(private driverView: DriverViewService,
    private fb: FormBuilder,
    private dialog: MatDialog) { }

  ngOnInit(): void {

    this.driverViewAssignments = this.driverView.getAssignmentByStatus(this.actionStatus);
    
  }

  togglebuttonSelection(subAction: string , actionStatusName: string , assignment: DriverAssignments) {

    let recordForm = this.fb.group(assignment);
    
    this.openDriverActionDialog(this.driverView.getDriverViewQuestionFormGroupByActionTypeAndSubAction(actionStatusName, subAction) ,recordForm);

  }

  openDriverActionDialog(formBuilderArrayVal: any,assignmentFormGroup: FormGroup) {

    const dialogRef = this.dialog.open(DriverActionDialogComponent, {
      minWidth: '100vw',
      data: {
        formBuilderArray: formBuilderArrayVal,
        formGroup: assignmentFormGroup
      }
    });
  }

}
