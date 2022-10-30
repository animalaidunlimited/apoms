import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RotationArea } from 'src/app/core/models/rota';
import { RotaSettingsService } from '../../services/rota-settings.service';
import { Observable, Subject } from 'rxjs';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-rotation-area-editor',
  templateUrl: './rotation-area-editor.component.html',
  styleUrls: ['./rotation-area-editor.component.scss']
})
export class RotationAreaEditorComponent implements OnInit {

  errorMatcher = new CrossFieldErrorMatcher();

  rotationAreaForm = this.fb.group(
    {
      rotationAreaId: [],
      organisationId: [],
      rotationArea: ["", Validators.required],
      sortOrder: [],
      colour: ["#ffffff"],
      isDeleted: []
    });

    rotationAreas$!: Observable<RotationArea[]>;

    rotationAreaUnsubscribe = new Subject();

  constructor(
    private fb: FormBuilder,
    private rotaSettingsService: RotaSettingsService,
    private snackbar: SnackbarService
  ) {

    this.loadRotationAreas();
   }

  private loadRotationAreas() {
    this.rotationAreas$ = this.rotaSettingsService.getRotationAreas(true);
  }

  ngOnInit() {
    this.updateSortOrder();    
  }

  private updateSortOrder() {
    this.rotationAreas$.pipe(takeUntil(this.rotationAreaUnsubscribe)).subscribe(roles => {

      this.rotationAreaForm.get('sortOrder')?.setValue(roles?.length + 1);
      this.rotationAreaUnsubscribe.next();
    });
  }

  saveRotationArea() : void {

    this.rotaSettingsService.saveRotationArea(this.rotationAreaForm.value).then(response => {

      if(response.success === 1) {
        this.snackbar.successSnackBar("Rotation area updated successfully", "OK");
        this.rotationAreaForm.get('rotationAreaId')?.setValue(response.rotationAreaId);
        this.rotaSettingsService.updateRotationAreas();
        this.clearRotationArea();
        this.loadRotationAreas();
      }
      else {
        this.snackbar.errorSnackBar('An error occurred when attempting to save the rotation area: error RAE-53', 'OK');
      }

    });

  }

  clearRotationArea() : void {
    this.rotationAreaForm.reset();
    this.updateSortOrder();
    this.rotationAreaForm.get('colour')?.setValue('#ffffff');
  }

  hydrateRotationAreaForEdit(emittedRow: FormGroup) : void {
    this.rotationAreaForm = emittedRow;
  }

}
