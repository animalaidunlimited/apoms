import { ChangeDetectionStrategy, Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { UntypedFormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { CrossFieldErrorMatcher } from 'src/app/core/validators/cross-field-error-matcher';
import { BaseRotationRole, RotationRole } from 'src/app/core/models/rota';
import { Observable, Subject } from 'rxjs';
import { RotaSettingsService } from './../../services/rota-settings.service';
import { SnackbarService } from './../../../../../../core/services/snackbar/snackbar.service';
import { map, take } from 'rxjs/operators';
import { generateUUID } from 'src/app/core/helpers/utils';

@Component({
  selector: 'app-rotation-role-editor',
  templateUrl: './rotation-role-editor.component.html',
  styleUrls: ['./rotation-role-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RotationRoleEditorComponent implements OnInit, OnDestroy {

  private ngUnsubscribe = new Subject();

  errorMatcher = new CrossFieldErrorMatcher();

  resizeObservable$!: Observable<Event>;

  rotationRoleForm = this.fb.group({
    rotationRoleId: [],
    rotationRole: ["", Validators.required],
    colour: ["#ffffff"],
    shiftSegments: this.fb.array([]),
    sortOrder: [, Validators.required],
    organisationId: [],
    isDeleted: [],
  });



  rotationRoles$!: Observable<RotationRole[]>;
  rotationRolesForGenericTable$!: Observable<BaseRotationRole[]>;

  get shiftSegments() : FormArray {
    return this.rotationRoleForm.get("shiftSegments") as FormArray;
  }

  get shiftSegmentTypeId() : FormArray {
    return this.rotationRoleForm.get("shiftSegments") as FormArray;
  }

  constructor(
    private fb: UntypedFormBuilder,
    private rotaSettingsService: RotaSettingsService,    
    private snackbar: SnackbarService,
    private changeDetector : ChangeDetectorRef
  ) {    

    this.loadDropdowns();
  }

  private loadDropdowns() {
    
    this.rotationRoles$ = this.rotaSettingsService.getRotationRoles(true);
    this.rotationRolesForGenericTable$ = this.rotationRoles$.pipe(map(values => values?.map(value => {

      return {
        rotationRoleId: value.rotationRoleId,
        rotationRole: value.rotationRole,
        shiftSegments: value.shiftSegments,
        colour: value.colour,
        isDeleted: value.isDeleted,
        sortOrder: value.sortOrder
      }
    })
    .sort((a,b) => a.sortOrder - b.sortOrder)
    ));
    

  }

  ngOnInit() {
    
    this.updateSortOrder();
    this.rotaSettingsService.rotationAreasUpdated.subscribe(() => this.loadDropdowns());
    
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  private updateSortOrder(): void {
    this.rotationRoles$.pipe(take(1)).subscribe(roles => {

      this.rotationRoleForm.get('sortOrder')?.setValue(1 + (roles?.length || 0));
      this.changeDetector.markForCheck();
    });

  }

  public addShiftSegment() : void {

    const emptyShiftSegment = this.fb.group({
      rotationRoleShiftSegmentId: new FormControl<number | null>(null),
      rotationRoleShiftSegmentUUID: new FormControl<string | null>(generateUUID()),
      startTime: new FormControl<string | null>(null, Validators.required),
      endTime: new FormControl<string | null>(null, Validators.required),
      nextDay: new FormControl<boolean | null>(false, Validators.required),
      shiftSegmentTypeId: new FormControl<number | null>(null, Validators.required),
      isDeleted: new FormControl<boolean>(false, Validators.required)
    });

    this.shiftSegments.push(emptyShiftSegment);

  }

  saveRotationRole() : void {

    this.rotaSettingsService.saveRotationRole(this.rotationRoleForm.value).then(response => {
      
      const segmentUpsertSuccess = !response.shiftSegments.some(shiftSegment => shiftSegment.success === -1);

      if(response.rotationRoleSuccess === 1 && segmentUpsertSuccess) {
        this.snackbar.successSnackBar("Rotation role updated successfully", "OK");
        this.rotationRoleForm.get('rotationRoleId')?.setValue(response.rotationRoleId);
        this.loadDropdowns();
        this.changeDetector.markForCheck();
      }
      else {
        
        let message = "An error occurred when attempting to save the rotation role: error RRE-132";

        if(response.success === 2){

          message = "Role name already exists";
          this.rotationRoleForm.get("rotationRole")?.setErrors({duplicateRoleName: true});
          this.snackbar.errorSnackBar(message, 'OK');
          return;
        }

        if(!segmentUpsertSuccess){
          
          this.snackbar.errorSnackBar("An error occurred when attempting to save a shift segment: error RRE-143", 'OK');

          response.shiftSegments.forEach(segment => {
            if(segment.success !== 1){

              let errorSegment = this.shiftSegments.controls.find(control => 
                control.get('rotationRoleShiftSegmentUUID')?.value === segment.rotationRoleShiftSegmentUUID
              );

              errorSegment?.setErrors({updateError:true});
              this.changeDetector.markForCheck();
            }
          });

          return;

        }

        this.snackbar.errorSnackBar(message, 'OK');

        
      }

    });

  }

  clearRotationRole() : void {
    this.rotationRoleForm.reset({colour: '#ffffff'});
    this.shiftSegments.clear();
    this.updateSortOrder();
    this.changeDetector.markForCheck();
  }

  hydrateRotationRoleForEdit(emittedRow: FormGroup) : void {
    //We need to patch the values otherwise we just pass the formGroup object pointer which
    //causes the row in the table and the formGroup in the form on this page to point to the same object.
    //So when the form is reset, the row in the table becomes blank.
    const emittedRole:RotationRole = emittedRow.value;

    this.shiftSegments.clear();

    if(emittedRole.shiftSegments){
      emittedRole.shiftSegments.forEach(() => this.addShiftSegment());
    }

    this.rotationRoleForm.patchValue(emittedRow.value);
    this.changeDetector.markForCheck();
  }

  duplicateRotationRole() : void {

    this.rotationRoleForm.get("rotationRoleId")?.reset();
    this.snackbar.successSnackBar("Rotation role copied successfully", "OK");
    this.rotationRoleForm.get("rotationRole")?.setErrors({duplicateRoleName: true});

    this.shiftSegments.controls.forEach(control => {
      control.get('rotationRoleShiftSegmentId')?.reset();
      control.get('rotationRoleShiftSegmentUUID')?.setValue(generateUUID());
    });

    this.updateSortOrder();
  }

}