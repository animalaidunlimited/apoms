import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';
import { MediaItem } from '../../models/media';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialog } from '../confirm-dialog/confirmation-dialog.component';
import { PatientService } from 'src/app/modules/emergency-register/services/patient.service';

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
    private dialog: MatDialog,
    private patientService: PatientService) { }

  ngOnInit(): void {

    this.mediaForm = this.fb.group({
      patientMediaItemId: this.mediaItem.mediaItemId,
      mediaType: this.mediaItem.mediaType,
      localURL: this.mediaItem.localURL,
      datetime: this.mediaItem.datetime,
      comment: [this.mediaItem.comment],
      heightPX: this.mediaItem.heightPX,
      widthPX: this.mediaItem.widthPX,
      tags: this.fb.array([]),
      deleted: false
      // updated: [false, Validators.required]
    })

    this.tags = this.mediaForm.get("tags") as FormArray;



      this.mediaItem.tags.forEach(tag => {

        let newTag = JSON.parse(JSON.stringify(tag));


        this.tags.push(this.fb.control({
          tag: newTag.tag
        }));
      });


    // this.mediaForm.valueChanges.subscribe(() => {

    //   this.mediaForm.get("updated").setValue(true, {emitEvent:false});

    // })

  }

  ngOnDestroy(){

    if(this.mediaForm.touched){
      this.patientService.saveMediaItemMetadata(this.mediaForm.value);
    }



  }

  toggleVideo(event: any) {
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

remove(tag: string, index: number): void {

  this.mediaForm.markAsTouched();

  if (index >= 0) {
    this.tags.removeAt(index);
  }
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
