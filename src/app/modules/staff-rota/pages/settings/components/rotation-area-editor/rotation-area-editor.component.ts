import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormGroup, Validators } from '@angular/forms';
import { RotationArea } from 'src/app/core/models/rota';
import { RotaSettingsService } from '../../services/rota-settings.service';
import { Observable, Subject } from 'rxjs';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { takeUntil } from 'rxjs/operators';
import { ScheduleManager } from 'src/app/core/models/user';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';

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
      scheduleManagerId: [],
      scheduleManager: [""],
      sortOrder: [, Validators.required],
      colour: ["#ffffff"],
      isDeleted: [false]
    });

  rotationAreas$!: Observable<RotationArea[]>;
  
  rotationAreaUnsubscribe = new Subject();
  scheduleManagers$: Observable<ScheduleManager[]>;

  constructor(
    private fb: UntypedFormBuilder,
    private rotaSettingsService: RotaSettingsService,
    private snackbar: SnackbarService,
    private dropdown: DropdownService
  ) {

    this.loadRotationAreas();
    this.scheduleManagers$ = this.dropdown.getScheduleManagers();
   }

  private loadRotationAreas() {
    this.rotationAreas$ = this.rotaSettingsService.getRotationAreas(true);
  }

  ngOnInit() {
    this.updateSortOrder();    
  }

  private updateSortOrder() {
    this.rotationAreas$.pipe(takeUntil(this.rotationAreaUnsubscribe)).subscribe(roles => {

      this.rotationAreaForm.get('sortOrder')?.setValue(1 + (roles?.length || 0));

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

        let message = "An error occurred when attempting to save the rotation area: error RAE-74";

        if(response.success === 2){

          message = "Area name already exists";
          this.rotationAreaForm.get("rotationArea")?.setErrors({duplicateAreaName: true})

        }        

        this.snackbar.errorSnackBar(message, 'OK');
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
