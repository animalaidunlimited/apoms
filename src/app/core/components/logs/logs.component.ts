import { LoggerService } from './../../services/logger/logger.service';
import { Component, Inject, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatTableDataSource } from '@angular/material/table';

interface IncomingData {
  emergencyCaseId: string;
  patientFormArray: any[];
}

@Component({
  selector: 'app-logs',
  templateUrl: './logs.component.html',
  styleUrls: ['./logs.component.scss']
})
export class LogsComponent implements OnInit {
  @Input() recordForm!: FormGroup;
  logs:any;
  dataSource!: MatTableDataSource<any> ;
  displayedColumns: string[] = [
    'userName', 
    'changeTable',
    'loggedAction',
    'Date',
    'Time' 
  ];
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: IncomingData,
    private cdr:ChangeDetectorRef,
    private loggerService: LoggerService) {}

  ngOnInit(): void {
    
    const searchQuery = [this.data.emergencyCaseId,this.data.patientFormArray.map(patientDetails => {
      if(patientDetails.value.patientId !== 0){
        return patientDetails.value.patientId;
      }
    })].join(',');    
    this.initLogs(searchQuery);
  }
  async initLogs(searchQuery:string){
    const logs =  await this.loggerService.getLogger(searchQuery);
    if(logs){
      this.dataSource =new MatTableDataSource(logs);
    }
  }
}
