import { Component, OnInit } from '@angular/core';
import { Validators, UntypedFormBuilder, FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { RotationArea, RotationAreaPosition } from 'src/app/core/models/rota';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { RotaSettingsService } from '../../services/rota-settings.service';

@Component({
  selector: 'app-rotation-position-editor',
  templateUrl: './rotation-position-editor.component.html',
  styleUrls: ['./rotation-position-editor.component.scss']
})
export class RotationPositionEditorComponent implements OnInit {

  errorMatcher = new CrossFieldErrorMatcher();

  rotationAreaPositionForm = this.fb.group(
    {
      rotationAreaPositionId: [],
      organisationId: [],
      rotationAreaId: ["", Validators.required],
      rotationAreaPosition: ["", Validators.required],
      sortOrder: [, Validators.required],
      colour: ["#ffffff"],
      isDeleted: [false]
    });

  rotationAreas$!: Observable<RotationArea[]>;
  rotationAreaPositions$!: Observable<RotationAreaPosition[]>;

  rotationAreaUnsubscribe = new Subject();

  constructor(
    private fb: UntypedFormBuilder,
    private rotaSettingsService: RotaSettingsService,
    private snackbar: SnackbarService
  ) {

    this.loadRotationAreasAndPositions();
   }

 

  private loadRotationAreasAndPositions() {
    this.rotationAreas$ = this.rotaSettingsService.getRotationAreas(true);
    this.rotationAreaPositions$ = this.rotaSettingsService.getRotationAreaPositions(true);
  }

  ngOnInit() {
    this.updateSortOrder();    
  }

  private updateSortOrder() {
    this.rotationAreas$.pipe(takeUntil(this.rotationAreaUnsubscribe)).subscribe(roles => {

      this.rotationAreaPositionForm.get('sortOrder')?.setValue(1 + (roles?.length || 0));

      this.rotationAreaUnsubscribe.next();
    });
  }

  saveRotationArea() : void {

    this.rotaSettingsService.saveRotationArea(this.rotationAreaPositionForm.value).then(response => {

      if(response.success === 1) {
        this.snackbar.successSnackBar("Rotation area updated successfully", "OK");
        this.rotationAreaPositionForm.get('rotationAreaId')?.setValue(response.rotationAreaId);
        this.rotaSettingsService.updateRotationAreas();
        this.clearRotationArea();
        this.loadRotationAreasAndPositions();
      }
      else {

        let message = "An error occurred when attempting to save the rotation area: error RAE-74";

        if(response.success === 2){

          message = "Area name already exists";
          this.rotationAreaPositionForm.get("rotationArea")?.setErrors({duplicateAreaName: true})

        }        

        this.snackbar.errorSnackBar(message, 'OK');
      }

    });

  }

  clearRotationArea() : void {
    this.rotationAreaPositionForm.reset();
    this.updateSortOrder();
    this.rotationAreaPositionForm.get('colour')?.setValue('#ffffff');
  }

  hydrateRotationAreaForEdit(emittedRow: FormGroup) : void {
    this.rotationAreaPositionForm = emittedRow;
  }

}
