import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CensusService } from 'src/app/core/services/census/census.service';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UpdateCensusDialogComponent } from '../update-census-dialog/update-census-dialog/update-census-dialog.component';


export interface CensusRecord {
    date: string;
    area: string;
    action: string;
    days : number;
    order : number;
}

const ELEMENT_DATA: CensusRecord[] = [{ date: '', area: '', action: '', days: 0, order: 0}];

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
        this.census.getCensusByTag(this.tagNumber).then(response => {

            this.censusRecords = response;

            if(response){
                this.censusRecords.sort((record1, record2 ) => { return record1.order - record2.order; });
            }

        });

    }



    updateCensusDialog(element: CensusRecord): void {
        const dialogRef = this.dialog.open(UpdateCensusDialogComponent, {
            width:'80%',
            height:'auto',
            data: {
                censusUpdateDate : element.date
            },
        });

        dialogRef.componentInstance.onAdd.subscribe(value=>{
           if(value.action === 'Moved Out'){
               let lastDate : any = this.censusRecords[this.censusRecords.length-1].date;
               let date1:any = new Date(lastDate);
                let date2:any = new Date(value.date);
                let diffDays:any = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
                value.days = diffDays;

                this.censusRecords.push(value);
                this.censusTable.renderRows();
           }
           else{
               this.censusRecords.push(value);
               this.censusTable.renderRows();
           }

        });

        dialogRef.componentInstance.onRemove.subscribe(value=>{
            this.censusRecords.forEach(record=>{
                if(record.area === value.area && record.action === value.action
                    && record.date === value.date){
                        let index = this.censusRecords.indexOf(record)
                        this.censusRecords.splice(index,1);
                        this.censusTable.renderRows();
                    }
            })
        })

        dialogRef.afterClosed();
    }

    editCensus(element){
        this.updateCensusDialog(element)
    }

}
