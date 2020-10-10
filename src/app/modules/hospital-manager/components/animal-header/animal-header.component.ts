import { Component, OnInit, Input, Type } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ImageUploadDialog } from 'src/app/core/components/image-upload/image-upload.component';
import { MatDialog } from '@angular/material/dialog';
import { MediaPasteService } from 'src/app/core/services/media-paste.service';
import { SafeUrl } from '@angular/platform-browser';
import { MediaItem } from 'src/app/core/models/media';
import { MediaDialogComponent } from 'src/app/core/components/media-dialog/media-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';



@Component({
    // tslint:disable-next-line:component-selector
    selector: 'animal-header',
    // tslint:disable-next-line:no-host-metadata-property
    host: {
        '(window:paste)': 'handlePaste( $event )',
    },
    templateUrl: './animal-header.component.html',
    styleUrls: ['./animal-header.component.scss'],
})
export class AnimalHeaderComponent implements OnInit {
    @Input() recordForm: FormGroup;

    @Input() profileUrl: SafeUrl;

    selection: SelectionModel<FormGroup>;

    status: string;

    lastObjectUrl: string;

    mediaObject: MediaItem;

    // Only doing this so the checker doesn't complain.
    patientDetailsFormGroup:FormGroup;

    constructor(public dialog: MatDialog, public mediaPaster: MediaPasteService) {}

    ngOnInit() {
        this.status = this.recordForm.get('patientStatus.status').value;
        this.profileUrl = ['../../../../../assets/images/image_placeholder.png'];
        this.lastObjectUrl = '';

        this.patientDetailsFormGroup = this.recordForm.get('patientDetails') as FormGroup;

        this.mediaObject = {
            isPrimary : false,
            tags : [''],
            comment : '',
            widthPX : null,
            datetime : '',
            heightPX: null,
            localURL: '',
            mediaType: '',
            patientId: null,
            remoteURL: '',
            mediaItemId: null,
            uploadProgress$: null,
            updated: null
        };
    }

    launchImageModal(): void {
        const dialogRef = this.dialog.open(ImageUploadDialog, {
            width: '350px',
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result != null) {
            }
        });

    }

    public handlePaste(event: ClipboardEvent){

        const patientId = this.recordForm.get('patientDetails.patientId').value;

        // Pass the clipboard event down to the service, expect it to return an image URL
        const newItem: MediaItem = this.mediaPaster.handlePaste(event, patientId);

        this.profileUrl = newItem.localURL;

    }

    openMediaDialog(): void{
        const dialogRef = this.dialog.open(MediaDialogComponent, {
            minWidth: '50%',
            data: {
                tagNumber: this.recordForm.get('patientDetails.tagNumber').value,
                patientId: this.recordForm.get('patientDetails.patientId').value,
                // mediaItem: this.mediaObject
            }
        });

        dialogRef.afterClosed().subscribe(data=>{
            console.log(data);
        });
    }

    getcurrentPatient() {
        return this.selection.selected[0];
    }
}
