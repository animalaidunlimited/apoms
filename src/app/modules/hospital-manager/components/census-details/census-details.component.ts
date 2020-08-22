import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CensusService } from 'src/app/core/services/census/census.service';
import { MatTable } from '@angular/material/table';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { UpdateCensusDialogComponent } from '../update-census-dialog/update-census-dialog/update-census-dialog.component';


export interface CensusRecord {
    date: string | Date;
    area: string;
    action: string;
    days : number;
}

const ELEMENT_DATA: CensusRecord[] = [{ date: '', area: '', action: '', days: 0}];

@Component({
    selector: 'census-details',
    templateUrl: './census-details.component.html',
    styleUrls: ['./census-details.component.scss'],
})
export class CensusDetailsComponent implements OnInit {
    
    constructor(private census : CensusService ,
        private dialog : MatDialog) {}

    @Input() tagNumber: string;

    censusUpdatedate : Date | string;

    

    @ViewChild(MatTable) censusTable: MatTable<any>;

    tagnumber: string;
     

  displayedColumns: string[] = ['Date', 'Area', 'Action','Days'];
    censusRecords = ELEMENT_DATA;

    ngOnInit() {
        this.census.getCensusByTag(this.tagNumber).then(response =>
            (this.censusRecords = response));

    }



    updateCensusDialog(element: CensusRecord): void {
        const dialogRef = this.dialog.open(UpdateCensusDialogComponent, {
            width:'80%',
            height:'80%',
            data: {
                censusUpdateDate : element.date
            },
        });

        dialogRef.afterClosed().subscribe(value=>{
            this.ngOnInit();
        });
    }

    editCensus(element){
        this.updateCensusDialog(element)
    }





}
