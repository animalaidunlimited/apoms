import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ConfirmationDialog } from 'src/app/core/components/confirm-dialog/confirmation-dialog.component';
import { TreatmentRecordComponent } from 'src/app/core/components/treatment-record/treatment-record.component';
import { TreatmentRecord } from 'src/app/core/models/treatment';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { TreatmentService } from 'src/app/core/services/treatment/treatment.service';


const ELEMENT_DATA: TreatmentRecord[] = [];

@Component({
  selector: 'treatment-details',
  templateUrl: './treatment.component.html',
  styleUrls: ['./treatment.component.scss']
})
export class TreatmentComponent implements OnInit {

  @ViewChild(MatTable) treatmentTable!: MatTable<any>;
  @Input() patientId!: number;

  displayedColumns: string[] = ['Treatment date', 'Eye discharge', 'Nasal discharge','Comment','Delete'];
  treatmentRecords = ELEMENT_DATA;
  eyeDischarge!: any[];
  nasalDischarge!: any[];
  private ngUnsubscribe = new Subject();

  constructor(
    private treatmentService: TreatmentService,
    private dropdown: DropdownService,
    private dialog : MatDialog
  ) { }

  ngOnInit(): void {

    this.eyeDischarge = this.dropdown.getEyeDischarge();
    this.nasalDischarge = this.dropdown.getNasalDischarge();

    this.initialiseTreatments();
  }

  async initialiseTreatments()
  {
    const treatments:TreatmentRecord[] = await this.treatmentService.getTreatmentsByPatientId(this.patientId);

    if(!treatments){
      return;
    }

    this.treatmentRecords = treatments.map(element => {

      element.eyeDischarge = this.eyeDischarge.find(elem => elem.key === element.eyeDischarge)?.value;
      element.nasalDischarge = this.nasalDischarge.find(elem => elem.key === element.nasalDischarge)?.value;

      return element;

    });

  }

  editTreatment(row:TreatmentRecord){
    this.openTreatmentDialog(row, 'update');
  }

  addTreatment(){

    const newTreatment:TreatmentRecord = {
      treatmentId: -1,
      patientId: this.patientId,
      treatmentDateTime: '',
      nextTreatmentDateTime: '',
      eyeDischarge: '',
      nasalDischarge: '',
      comment: '',
      deleted: false
    };

    this.openTreatmentDialog(newTreatment, 'insert');
  }

  deleteTreatment(row:TreatmentRecord){

    const action = row.deleted ? 'un-deleted' : 'delete';

    const message = `Are you sure want to ${action} this treatment?`;

    const dialogRef = this.dialog.open(ConfirmationDialog,{
      data:{
        message,
        buttonText: {
          ok: 'Yes',
          cancel: 'Cancel'
        }
      }
    });

    dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe((confirmed: boolean) => {
      if (confirmed) {

        row.deleted = !row.deleted;

        const saveRow:TreatmentRecord = JSON.parse(JSON.stringify(row));

        saveRow.eyeDischarge = this.eyeDischarge.find(elem => elem.value = row.eyeDischarge).key;
        saveRow.nasalDischarge = this.nasalDischarge.find(elem => elem.value = row.nasalDischarge).key;

        this.treatmentService.saveTreatment(saveRow);

      }
    });

  }


  openTreatmentDialog(row:TreatmentRecord, source:string): void {

    const dialogRef = this.dialog.open(TreatmentRecordComponent, {
        width: '650px',
        data: {
          patientId: row.patientId,
          treatmentId: row.treatmentId
        },
    });

    dialogRef.afterClosed().pipe(takeUntil(this.ngUnsubscribe)).subscribe(treatment => {

      if(!treatment){
        return;
      }

      treatment.eyeDischarge = this.eyeDischarge.find(elem => elem.key === treatment.eyeDischarge)?.value;
      treatment.nasalDischarge = this.nasalDischarge.find(elem => elem.key === treatment.nasalDischarge)?.value;

    if(source === 'update'){

            const currentTreatment = this.treatmentRecords.find(elem => elem.treatmentId === treatment.treatmentId);

            Object.assign(currentTreatment, treatment);
    }

    else if (source === 'insert'){

      this.treatmentRecords.push(treatment);
    }

    this.treatmentTable.renderRows();

    });
}

}