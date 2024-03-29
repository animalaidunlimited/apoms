import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { SurgeryService } from 'src/app/core/services/surgery/surgery.service';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { SurgeryRecord } from 'src/app/core/models/surgery-details';
import { SurgeryRecordDialogComponent } from '../surgery-record-dialog/surgery-record-dialog.component';
import { take } from 'rxjs/operators';


const ELEMENT_DATA: SurgeryRecord[] = [];

@Component({
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'surgery-details',
    templateUrl: './surgery-details.component.html',
    styleUrls: ['./surgery-details.component.scss'],
})
export class SurgeryDetailsComponent implements OnInit {

    constructor(
        private surgeryService: SurgeryService,
        public dialog: MatDialog
    ) {}

    @Input() patientId!: number;
    @Input() tagNumber!: string;
    @Input() emergencyNumber!: number;
    @Input() animalType!: string;
    @ViewChild(MatTable) surgeryTable!: MatTable<any>;

    tagnumber = '';
    date: string | Date = '';
    type = '';
    surgeon = '';
    site = '';
    anesthesiaMinutes = 0;

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

                this.surgeryRecords = response ? response : [];
                this.surgeryRecords.sort((s1, s2) => (new Date(s2.date) as any) - (new Date(s1.date) as any));

            });
    }

    launchSurgeryDialog(row: SurgeryRecord | null): void {

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

        dialogRef.afterClosed().pipe(take(1)).subscribe(result => {

            if(result){

                const index = this.surgeryRecords.findIndex(
                    (surgery) => {
                        return surgery.surgeryId === result.surgeryId;
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
