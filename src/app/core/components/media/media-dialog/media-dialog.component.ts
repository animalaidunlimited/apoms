import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Platform } from '@angular/cdk/platform';
import { BehaviorSubject, Subject } from 'rxjs';
import { MediaItem } from 'src/app/core/models/media';
import { PatientService } from 'src/app/core/services/patient/patient.service';
import { FormBuilder, FormGroup } from '@angular/forms';

interface IncomingData {
  tagNumber: string;
  patientId: number;
  mediaVal: File[];
}

@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'media-dialog',
  templateUrl: './media-dialog.component.html',
  styleUrls: ['./media-dialog.component.scss']
})

export class MediaDialogComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  mediaData!: BehaviorSubject<MediaItem[]>;

  recordForm: FormGroup = new FormGroup({});

  constructor(public dialogRef: MatDialogRef<MediaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IncomingData,
    private patientService: PatientService,
    private fb: FormBuilder,
    public dialog: MatDialog,
    public platform: Platform) { }

  ngOnInit(): void {

    this.mediaData = this.patientService.getPatientMediaItemsByPatientId(this.data.patientId);

    this.recordForm =  this.fb.group({
      patientDetails: this.fb.group({
          patientId: [this.data.patientId]
      })
    });


  }

  ngOnDestroy() {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
  }


closeDialog(){
  this.dialogRef.close();
}

}
