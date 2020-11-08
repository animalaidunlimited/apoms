import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MediaPasteService } from 'src/app/core/services/media-paste/media-paste.service';
import { SafeUrl } from '@angular/platform-browser';
import { MediaItem } from 'src/app/core/models/media';
import { MediaDialogComponent } from 'src/app/core/components/media-dialog/media-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { of } from 'rxjs';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'animal-header',
    templateUrl: './animal-header.component.html',
    styleUrls: ['./animal-header.component.scss'],
})
export class AnimalHeaderComponent implements OnInit {
    @Input() recordForm!: FormGroup;

    @Input() profileUrl!: SafeUrl;

    selection!: SelectionModel<FormGroup>;

    status = '';

    lastObjectUrl = '';

    mediaObject!: MediaItem;

    // Only doing this so the checker doesn't complain.
    patientDetailsFormGroup:FormGroup = new FormGroup({});

    constructor(public dialog: MatDialog, public mediaPaster: MediaPasteService) {}

    ngOnInit() {
        this.status = this.recordForm.get('patientStatus.status')?.value;
        this.profileUrl = '../../../../../../assets/images/image_placeholder.png';
        this.lastObjectUrl = '';

        this.patientDetailsFormGroup = this.recordForm.get('patientDetails') as FormGroup;

        this.mediaObject = {
            isPrimary : false,
            tags : [''],
            comment : '',
            widthPX : 0,
            datetime : '',
            heightPX: 0,
            localURL: '',
            mediaType: '',
            patientId: 0,
            remoteURL: '',
            mediaItemId: of(0),
            patientMediaItemId: 0,
            uploadProgress$: null,
            updated: false,
            deleted: false
        };
    }

    openMediaDialog(): void{
        const dialogRef = this.dialog.open(MediaDialogComponent, {
            minWidth: '50%',
            data: {
                tagNumber: this.recordForm.get('patientDetails.tagNumber')?.value,
                patientId: this.recordForm.get('patientDetails.patientId')?.value,
            }
        });

        dialogRef.afterClosed().subscribe(updatedMedia=>{
            if(updatedMedia){
                if(updatedMedia.isPrimary === true){
                    this.profileUrl = updatedMedia.remoteURL;
                }
            }
        });
    }

    getcurrentPatient() {
        return this.selection.selected[0];
    }
}
