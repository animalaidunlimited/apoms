import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { BaseRotationRole, RotationArea, RotationRole } from 'src/app/core/models/rota';
import { Observable, Subject } from 'rxjs';
import { RotaSettingsService } from './../../services/rota-settings.service';
import { SnackbarService } from './../../../../../../core/services/snackbar/snackbar.service';
import { map, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-rotation-role-editor',
  templateUrl: './rotation-role-editor.component.html',
  styleUrls: ['./rotation-role-editor.component.scss']
})
export class RotationRoleEditorComponent implements OnInit {

  errorMatcher = new CrossFieldErrorMatcher();

  rotationRoleForm = this.fb.group({
    rotationRoleId: [],
    rotationAreaId: ["", Validators.required],
    rotationRole: ["", Validators.required],
    colour: ["#ffffff"],
    startTime: ["", Validators.required],
    endTime: ["", Validators.required],
    sortOrder: [, Validators.required],
    organisationId: [],
    isDeleted: [],
  });

  rotationArea$!: Observable<RotationArea[]>;
  rotationRoles$!: Observable<RotationRole[]>;
  rotationRolesForGenericTable$!: Observable<BaseRotationRole[]>;

  rotationRolesUnsubscribe = new Subject();

  constructor(
    private fb: FormBuilder,
    private rotaSettingsService: RotaSettingsService,
    private snackbar: SnackbarService
  ) { 

    this.loadDropdowns();

  }

  private loadDropdowns() {
    this.rotationArea$ = this.rotaSettingsService.getRotationAreas(false);
    this.rotationRoles$ = this.rotaSettingsService.getRotationRoles(true);
    this.rotationRolesForGenericTable$ = this.rotationRoles$.pipe(map(values => values.map(value => {

      return {
        rotationRoleId: value.rotationRoleId,
        rotationRole: value.rotationRole,
        rotationAreaId: value.rotationAreaId,
        startTime: value.startTime,
        endTime: value.endTime,
        colour: value.colour,
        isDeleted: value.isDeleted,
        sortOrder: value.sortOrder
      }
    })
    .sort((a,b) => a.sortOrder - b.sortOrder)
    ))

  }

  ngOnInit() {

    this.updateSortOrder();
    this.rotaSettingsService.rotationAreasUpdated.subscribe(() => this.loadDropdowns());

  }

  private updateSortOrder(): void {
    this.rotationRoles$.pipe(takeUntil(this.rotationRolesUnsubscribe)).subscribe(roles => {

      this.rotationRoleForm.get('sortOrder')?.setValue(1 + (roles?.length || 0));
      this.rotationRolesUnsubscribe.next();
    });
  }

  saveRotationRole() : void {

    this.rotaSettingsService.saveRotationRole(this.rotationRoleForm.value).then(response => {

      console.log(this.rotationRoleForm.value)

      if(response.success === 1) {
        this.snackbar.successSnackBar("Rotation role updated successfully", "OK");
        this.rotationRoleForm.get('rotationRoleId')?.setValue(response.rotationRoleId);
        this.loadDropdowns();
        this.clearRotationRole();
      }
      else {
        this.snackbar.errorSnackBar('An error occurred when attempting to save the rotation role: error RRE-53', 'OK');
      }

    });



  }

  clearRotationRole() : void {
    this.rotationRoleForm.reset();
    this.updateSortOrder();
    this.rotationRoleForm.get('colour')?.setValue('#ffffff');
  }

  hydrateRotationRoleForEdit(emittedRow: FormGroup) : void {
    this.rotationRoleForm = emittedRow;
  }

}


