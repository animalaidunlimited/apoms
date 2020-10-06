import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ImageUploadDialog } from 'src/app/core/components/image-upload/image-upload.component';
import { MatDialog } from '@angular/material/dialog';
import { MediaPasteService } from 'src/app/core/services/media-paste/media-paste.service';
import { SafeUrl } from '@angular/platform-browser';
import { MediaItem } from 'src/app/core/models/media';



@Component({
    selector: 'animal-header',
    host: {
        '(window:paste)': 'handlePaste( $event )',
    },
    templateUrl: './animal-header.component.html',
    styleUrls: ['./animal-header.component.scss'],
})
export class AnimalHeaderComponent implements OnInit {
    @Input() recordForm: FormGroup;

    status: string;

    imageUrls: SafeUrl[];

    lastObjectUrl: string;

    // Only doing this so the checker doesn't complain.
    patientDetailsFormGroup:FormGroup;

    constructor(public dialog: MatDialog, public mediaPaster: MediaPasteService) {}

    ngOnInit() {
        this.status = this.recordForm.get('patientStatus.status').value;
        this.imageUrls = ['../../../../../assets/images/image_placeholder.png'];
        this.lastObjectUrl = '';

        this.patientDetailsFormGroup = this.recordForm.get('patientDetails') as FormGroup;
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
        const newItem: MediaItem = this.mediaPaster.handlePaste(event, patientId)

        this.imageUrls[0] = newItem.localURL;

    }
}
