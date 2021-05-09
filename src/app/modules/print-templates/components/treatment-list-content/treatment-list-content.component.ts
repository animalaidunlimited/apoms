import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { ReportPatientRecord, TreatmentListPrintContent } from 'src/app/core/models/treatment-lists';
import { PrintTemplateService } from '../../services/print-template.service';

@Component({
  selector: 'app-treatment-list-content',
  templateUrl: './treatment-list-content.component.html',
  styleUrls: ['./treatment-list-content.component.scss']
})
export class TreatmentListContentComponent implements OnInit {

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns:string[] = [];
  columnsExcludingIndex: string[] = [];
  tableData:MatTableDataSource<ReportPatientRecord>;
  treatmentList:TreatmentListPrintContent | undefined;
  printDate = new Date();

  constructor(
    route: ActivatedRoute,
    private printService: PrintTemplateService
  ) {


    if(route.snapshot.params.treatmentList){
      this.treatmentList = JSON.parse(route.snapshot.params.treatmentList);
    }
    this.tableData = new MatTableDataSource(this.treatmentList?.printList);
  }

  ngOnInit(): void {

    if(this.treatmentList?.displayColumns){
      this.displayedColumns = this.treatmentList.displayColumns;
    }
    
    this.columnsExcludingIndex = this.displayedColumns.filter(column => column !== 'index');
    this.tableData.sort = this.sort;
    this.printService.onDataReady('treatment-list');

  }

}
