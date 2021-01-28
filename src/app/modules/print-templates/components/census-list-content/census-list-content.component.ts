import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { CensusPrintContent, ReportPatientRecord } from 'src/app/core/models/census-details';
import { PrintTemplateService } from '../../services/print-template.service';

@Component({
  selector: 'app-census-list-content',
  templateUrl: './census-list-content.component.html',
  styleUrls: ['./census-list-content.component.scss']
})
export class CensusListContentComponent implements OnInit {

  @ViewChild(MatSort) sort!: MatSort;

  displayedColumns:string[] = [];
  columnsExcludingIndex: string[] = [];
  tableData:MatTableDataSource<ReportPatientRecord>;
  censusList:CensusPrintContent;
  printDate = new Date();

  constructor(
    route: ActivatedRoute,
    private printService: PrintTemplateService
  ) {
    this.censusList = JSON.parse(route.snapshot.params.censusList);
    this.tableData = new MatTableDataSource(this.censusList.printList);
  }

  ngOnInit(): void {

    this.displayedColumns = this.censusList.displayColumns;
    this.columnsExcludingIndex = this.displayedColumns.filter(column => column !== 'index');
    this.tableData.sort = this.sort;
    this.printService.onDataReady('census-list');

  }

}
