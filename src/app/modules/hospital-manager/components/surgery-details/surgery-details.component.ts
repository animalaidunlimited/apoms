import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SurgeryService } from 'src/app/core/services/surgery/surgery.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { SurgeryRecordDialogComponent } from '../../components/surgery-record-dialog/surgery-record-dialog/surgery-record-dialog.component';

export interface SurgeryRecord {
    surgeryId: number;
    date: string | Date;
    type: string;
    surgeon: string;
    site: string;
    anesthesiaMinutes: number;
    died: string;
    comments: string;
    antibioticsGiven: string;
}

const ELEMENT_DATA: SurgeryRecord[] = [];

@Component({
    selector: 'surgery-details',
    templateUrl: './surgery-details.component.html',
    styleUrls: ['./surgery-details.component.scss'],
})
export class SurgeryDetailsComponent implements OnInit {
    [x: string]: any;
    constructor(
        private surgeryService: SurgeryService,
        public dialog: MatDialog,
    ) {}
    @Input() patientId: number;
    @Input() tagNumber: string;
    @Input() emergencyNumber: number;
    @Input() animalType: string;
    @ViewChild(MatTable) surgeryTable: MatTable<any>;
    tagnumber: string;
    date: string | Date;
    type: string;
    surgeon: string;
    site: string;
    anesthesiaMinutes: number;

    displayedColumns: string[] = [
        'Date',
        'Type',
        'Surgeon',
        'Site',
        'Anesthesia Minutes',
        'Edit Surgery',
    ];
    surgeryRecords = ELEMENT_DATA;

    ngOnInit() {

        this.surgeryService
            .getSurgeryByPatientId(this.patientId)
            .then(response => {

                if(response){
                    this.surgeryRecords = response;
                    this.surgeryRecords.sort((s1, s2) => {return <any>new Date(s2.date) - <any>new Date(s1.date)})
                }

            } );
    }

    launchSurgeryDialog(row: SurgeryRecord): void {

        const dialogRef = this.dialog.open(SurgeryRecordDialogComponent, {

            maxWidth: '100vw',
            maxHeight: '100vh',
            data: {
                patientId: this.patientId,
                surgeryId: row?.surgeryId,
                emergencyNumber: this.emergencyNumber,
                tagNumber: this.tagNumber,
                animalType: this.animalType,
            },
        });

        dialogRef.afterClosed().subscribe(result => {

            if(result){

                const index = this.surgeryRecords.findIndex(
                    (surgery) => {
                        return surgery.surgeryId === result.surgeryId
                    });

                if(index > -1){
                    this.surgeryRecords.splice(index, 1, result);
                    this.surgeryTable.renderRows();
                } else {
                    this.surgeryRecords.push(result);
                    this.surgeryTable.renderRows();
                }
            }
        });
    }

}
