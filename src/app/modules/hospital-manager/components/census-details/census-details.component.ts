import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CensusService } from 'src/app/core/services/census/census.service';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { UpdateCensusDialogComponent } from '../update-census-dialog/update-census-dialog.component';
import { take } from 'rxjs/operators';


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

    @Input() tagNumber!: string;

    censusUpdatedate : Date | string = '';

    @ViewChild(MatTable) censusTable!: MatTable<any>;

    tagnumber = '';

    displayedColumns: string[] = ['Date', 'Area', 'Action','Days'];
    censusRecords = ELEMENT_DATA;

    ngOnInit() {
        this.census.getCensusByTag(this.tagNumber).then(response => {

            this.censusRecords = response;

            // TODO
            // Sort by date, and if the dates are the same order by the action.
            // This would mean if there was more than one moved it it would cause problems, so will need
            // to tidy this up as part of https://github.com/animalaidunlimited/apoms/issues/91
            if(response){
               this.censusRecords
               .sort((record1, record2 ) =>

               record1.date < record2.date ? -1 :
                    record1.date === record2.date ?
                        (record1.action < record2.action ? 1 : -1) : 1
               );
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

        dialogRef.componentInstance.addCensusRecord.pipe(take(1)).subscribe((value:CensusRecord)=>{
           if(value.action === 'Moved Out'){
               const lastDate : any = this.censusRecords[this.censusRecords.length-1].date;
               const date1:any = new Date(lastDate);
                const date2:any = new Date(value.date);
                const diffDays:any = Math.floor((date2 - date1) / (1000 * 60 * 60 * 24));
                value.days = diffDays;

                this.censusRecords.push(value);
                this.censusTable.renderRows();
           }
           else{
               this.censusRecords.push(value);
               this.censusTable.renderRows();
           }

        });

        dialogRef.componentInstance.removeCensusRecord.pipe(take(1)).subscribe((value:CensusRecord)=>{
            this.censusRecords.forEach(record=>{
                if(record.area === value.area && record.action === value.action
                    && record.date === value.date){
                        const index = this.censusRecords.indexOf(record);
                        this.censusRecords.splice(index,1);
                        this.censusTable.renderRows();
                    }
            });
        });

        dialogRef.afterClosed();
    }

    editCensus(element:CensusRecord){
        this.updateCensusDialog(element);
    }

}
