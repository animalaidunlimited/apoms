import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MatLegacyDialog as MatDialog, MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA } from '@angular/material/legacy-dialog';
import { Platform } from '@angular/cdk/platform';
import { MediaItem } from 'src/app/core/models/media';
import { BehaviorSubject, Subject } from 'rxjs';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';
import { MediaService } from 'src/app/core/services/media/media.service';

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

  recordForm: FormGroup = new FormGroup({});

  constructor(public dialogRef: MatDialogRef<MediaDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: IncomingData,
    private mediaService: MediaService,
    private fb: UntypedFormBuilder,
    public dialog: MatDialog,
    public platform: Platform) { }

  ngOnInit(): void {

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
