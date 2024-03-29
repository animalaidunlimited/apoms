import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UniqueTagNumberValidator } from 'src/app/core/validators/tag-number.validator';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

interface DialogData {
    tagNumber: string;
    emergencyCaseId: number;
    patientId: number;
    duplicate: boolean;
}

@Component({
    selector: 'tag-number-dialog',
    templateUrl: './tag-number-dialog.component.html',
    styleUrls: ['./tag-number-dialog.component.scss'],
})

export class TagNumberDialog implements OnInit, OnDestroy {

    private ngUnsubscribe = new Subject();

    errorMatcher = new CrossFieldErrorMatcher();

    constructor(
        public MatDialogRef: MatDialogRef<TagNumberDialog>,
        @Inject(MAT_DIALOG_DATA) public data: DialogData,
        private fb: UntypedFormBuilder,
        private uniqueTagNumberValidator: UniqueTagNumberValidator
    ) {}

    tagForm: FormGroup = new FormGroup({});

    ngOnInit() {

        // Use an AbstractControl here because the async validator relies on having one.
        const patientIdControl = this.fb.control({value: this.data.patientId});

        this.tagForm = this.fb.group({
            tagNumber: [
                this.data.tagNumber,
                ,
                this.uniqueTagNumberValidator.validate(
                    this.data.emergencyCaseId,
                    patientIdControl.value,
                ),
            ],
        });

        this.tagForm.valueChanges
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(changes => {
            this.data.tagNumber = changes.tagNumber;
        });

    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    onCancel(): void {
        this.MatDialogRef.close();
    }
}
