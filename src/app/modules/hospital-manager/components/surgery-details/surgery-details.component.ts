import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SurgeryService } from 'src/app/core/services/surgery/surgery.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { SurgeryRecordDialogComponent } from '../../components/surgery-record-dialog/surgery-record-dialog/surgery-record-dialog.component';
import { AddSurgeryDialogComponent } from '../add-surgery-dialog/add-surgery-dialog.component';
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

const ELEMENT_DATA: SurgeryRecord[] = [
    {
        surgeryId: null,
        date: '',
        type: '',
        surgeon: '',
        site: '',
        anesthesiaMinutes: 0,
        died: '',
        comments: '',
        antibioticsGiven: '',
    },
];

@Component({
    selector: 'surgery-details',
    templateUrl: './surgery-details.component.html',
    styleUrls: ['./surgery-details.component.scss'],
})
export class SurgeryDetailsComponent implements OnInit {

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
            .then(response => (this.surgeryRecords = response));
    }


    updateSurgeryDialog(row: SurgeryRecord): void {
        const dialogRef = this.dialog.open(SurgeryRecordDialogComponent, {
            maxWidth: '100vw',
            maxHeight: '100vh',
            width: '90%',
            height: '80%',
            data: { surgeryId: row.surgeryId, animalType: this.animalType },
        }); 

        dialogRef.afterClosed().subscribe(result => {
            if(result){
                const index = this.surgeryRecords.findIndex(
                    x => x.surgeryId == result.surgeryId);
                this.surgeryRecords.splice(index, 1, result);
                this.surgeryTable.renderRows();
            }
        });
    }
    addSurgeryDialog() {
        const dialogRef = this.dialog.open(AddSurgeryDialogComponent, {
            maxWidth: '100vw',
            maxHeight: '100vh',
            width: '90%',
            height: '90%',
            data: {
                patientId: this.patientId,
                emergencyNumber: this.emergencyNumber,
                tagNumber: this.tagNumber,
                animalType: this.animalType,
            },
        });
        dialogRef.afterClosed().subscribe(result => {
            console.log(result);
            if (result) {
                if(!this.surgeryRecords[0].site==true){
                    this.surgeryRecords.splice(0, 1, result);
                    this.surgeryTable.renderRows();
                }

                else{
                    this.surgeryRecords.push(result);
                    this.surgeryTable.renderRows();    
                }
            }
        });
    }

    addSurgery() {
        this.addSurgeryDialog();
    }

    updateSurgery(row) {
        this.updateSurgeryDialog(row);
    }

}
