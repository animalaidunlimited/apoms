import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MediaItem } from '../../models/media';
import { FormGroup, FormBuilder, FormArray, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../confirm-dialog/confirmation-dialog.component';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'media-card',
  templateUrl: './media-card.component.html',
  styleUrls: ['./media-card.component.scss']
})
export class MediaCardComponent implements OnInit, OnDestroy {

  @Input() mediaItem: MediaItem;
  @Input() tagNumber: string;
  @Output() itemDeleted: EventEmitter<boolean> = new EventEmitter();



  @ViewChild('videoPlayer',{ read: ElementRef, static:false }) videoplayer: ElementRef;

  addOnBlur = true;
  removable = true;
  selectable = true;
  visible = true;

  mediaForm:FormGroup;
  tags:FormArray;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  constructor(private fb:FormBuilder,
    private patientService: PatientService,
    private dialog: MatDialog) { }

  ngOnInit(): void {

    this.mediaForm = this.fb.group({
      patientMediaItemId: null,
      mediaType: this.mediaItem.mediaType,
      localURL: this.mediaItem.localURL,
      remoteURL: this.mediaItem.remoteURL,
      datetime: this.mediaItem.datetime,
      comment: [this.mediaItem.comment],
      heightPX: this.mediaItem.heightPX,
      widthPX: this.mediaItem.widthPX,
      tags: this.fb.array([]),
      deleted: false
    })

    this.tags = this.mediaForm.get('tags') as FormArray;

      this.mediaItem.tags.forEach(tag => {

        const newTag = JSON.parse(JSON.stringify(tag));

        this.tags.push(this.fb.control({
          tag: newTag.tag
        }));
      });
  }

  ngOnDestroy(){



    // this.mediaItem.mediaItemId.subscribe(resultObject => {

    //   this.mediaForm.get("patientMediaItemId").setValue(resultObject);
    // })

    if(this.mediaForm.touched){


      this.mediaItem.mediaItemId.subscribe((itemId) => {


        this.mediaForm.get('patientMediaItemId').setValue(itemId);

        // TODO This is late arriving, it's luckily a timing thing that makes sure there's a value.
        // We should turn this into an observable.
        this.mediaForm.get('remoteURL').setValue(this.mediaItem.remoteURL);

        this.patientService.savePatientMedia(this.mediaForm.value);
      });

    }

  }

toggleVideo() {
    this.videoplayer.nativeElement.play();
}

add(event: MatChipInputEvent): void {
  const input = event.input;
  const value = event.value;

  this.mediaForm.markAsTouched();

  if ((value || '').trim()) {

    this.tags.push(this.fb.control({
      tag: value.trim()
    }));
  }

  // Reset the input value
  if (input) {
    input.value = '';
  }


}

remove(index: number): void {

  this.mediaForm.markAsTouched();

  this.tags.removeAt(index);

}

deleteMediaItem(){

  const dialogRef = this.dialog.open(ConfirmationDialog,{
    data:{
      message: 'Are you sure want to delete?',
      buttonText: {
        ok: 'Yes',
        cancel: 'No'
      }
    }
  });

  dialogRef.afterClosed().subscribe((confirmed: boolean) => {
    if (confirmed) {
      this.itemDeleted.emit(true);
      this.mediaForm.get('deleted').setValue(true);
      this.mediaForm.markAsTouched();
    }
  });

}

}
