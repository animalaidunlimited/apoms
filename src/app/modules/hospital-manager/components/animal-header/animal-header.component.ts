import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ImageUploadDialog } from 'src/app/core/components/image-upload/image-upload.component';
import { MatDialog } from '@angular/material/dialog';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';

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

    constructor(public dialog: MatDialog, private sanitizer: DomSanitizer) {}

    ngOnInit() {
        this.status = this.recordForm.get('patientStatus.status').value;
        this.imageUrls = ['../../../../../assets/images/image_placeholder.png'];
        this.lastObjectUrl = '';
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

    public handlePaste(event: ClipboardEvent): void {
        const pastedImage = this.getPastedImage(event);

        if (!pastedImage) {
            return;
        }
        if (this.lastObjectUrl) {
            URL.revokeObjectURL(this.lastObjectUrl);
        }

        this.lastObjectUrl = URL.createObjectURL(pastedImage);

        this.imageUrls[0] = this.sanitizer.bypassSecurityTrustUrl(
            this.lastObjectUrl,
        );
    }

    private getPastedImage(event: ClipboardEvent): File | null {
        if (
            event.clipboardData &&
            event.clipboardData.files &&
            event.clipboardData.files.length &&
            this.isImageFile(event.clipboardData.files[0])
        ) {
            return event.clipboardData.files[0];
        }

        return null;
    }

    // Determine if the given File is an Image (according do its Mime-Type).
    private isImageFile(file: File): boolean {
        return file.type.search(/^image\//i) === 0;
    }
}
