import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, FormArray } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

interface DialogData {
  assignments: AbstractControl[]
}

@Component({
  selector: 'app-area-staff-coverage',
  templateUrl: './area-staff-coverage.component.html',
  styleUrls: ['./area-staff-coverage.component.scss']
})

export class AreaStaffCoverageComponent implements OnInit {

  assignmentForm = this.fb.group({
    assignments: this.fb.array([])
  })

  get getAssignments() : FormArray {
    return this.assignmentForm.get('assignments') as FormArray
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    private fb: UntypedFormBuilder,
    private dialogRef: MatDialogRef<AreaStaffCoverageComponent>
  ) { }

  ngOnInit() {

    for(let assignment of this.data.assignments){
      this.getAssignments.push(assignment);
    }
  }

}
