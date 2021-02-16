import { Component, Inject, Input, OnInit } from '@angular/core';
import { ControlContainer, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

interface IncomingData {
  emergencyCaseId: string;
  patientId: number;
  mediaVal: File[];
}

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {
  @Input() recordForm!: FormGroup;
  dataSource: MatTableDataSource<any> ;
  displayedColumns: string[] = [
    'userName', 
    'changeTable',
    'loggedAction',
    'DateTime' 
  ];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IncomingData) {
      const emptyRow = {
        userName : '', 
        changeTable: '', 
        loggedAction: '', 
        DateTime: ''
      };
      this.dataSource = new MatTableDataSource([emptyRow]);
     }

  ngOnInit(): void {
    console.log(this.data.emergencyCaseId);
  }

}
