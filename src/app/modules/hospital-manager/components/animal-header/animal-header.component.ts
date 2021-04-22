import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MediaPasteService } from 'src/app/core/services/navigation/media-paste/media-paste.service';
import { SafeUrl } from '@angular/platform-browser';
import { MediaItem } from 'src/app/core/models/media';
import { MediaDialogComponent } from 'src/app/core/components/media/media-dialog/media-dialog.component';
import { SelectionModel } from '@angular/cdk/collections';
import { of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
    // tslint:disable-next-line:component-selector
    selector: 'animal-header',
    templateUrl: './animal-header.component.html',
    styleUrls: ['./animal-header.component.scss'],
})

export class AnimalHeaderComponent implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject();

    @Input() recordForm!: FormGroup;
    @Input() profileUrl: SafeUrl = '../../../../../../assets/images/image_placeholder.png';

    selection!: SelectionModel<FormGroup>;

    status = '';

    lastObjectUrl = '';

    mediaObject!: MediaItem;

    // Only doing this so the checker doesn't complain.
    patientDetailsFormGroup:FormGroup = new FormGroup({});

    constructor(public dialog: MatDialog, public mediaPaster: MediaPasteService) {}

    ngOnInit() {

        this.status = this.recordForm.get('patientStatus.status')?.value;
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

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    openMediaDialog(): void{

        const dialogRef = this.dialog.open(MediaDialogComponent, {
            minWidth: '50%',
            data: {
                tagNumber: this.recordForm.get('patientDetails.tagNumber')?.value,
                patientId: this.recordForm.get('patientDetails.patientId')?.value,
            }
        });

        // TODO: Add the service to update the datetime in the image description by emmiting a behavior subject.
        dialogRef.afterClosed()
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(updatedMedia => {

            if(updatedMedia){
                if(updatedMedia.isPrimary === true){

                    this.profileUrl = updatedMedia.localURL || updatedMedia.remoteURL || this.profileUrl;
                }
            }
        });

    }

    getcurrentPatient() {
        return this.selection.selected[0];
    }
}
