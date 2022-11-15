import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { ModelFormGroup } from 'src/app/core/helpers/form-model';
import { RotaService } from '../../services/rota.service';
import { RotaDay, RotaDayAssignment, RotaDayAssignmentResponse, RotationArea, RotationAreaBase } from './../../../../core/models/rota';
import { RotaSettingsService } from './../settings/services/rota-settings.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { SnackbarService } from './../../../../core/services/snackbar/snackbar.service';

@Component({
  selector: 'app-daily-rota',
  templateUrl: './daily-rota.component.html',
  styleUrls: ['./daily-rota.component.scss']
})
export class DailyRotaComponent implements OnInit {

  private ngUnsubscribe = new Subject();

  rotaDayForm: FormArray;

  areaForm = this.fb.group({
    areas: new FormControl<number[] | undefined>(undefined)
  });

  areas: RotationArea[] = [];

  get selectedAreas(): number[] {
    return this.areaForm.get('areas')?.value || [];
  }

  rotaDays!: BehaviorSubject<RotaDay[]>;

  rotationPeriodId: number = -1;

  constructor(
    route: ActivatedRoute,
    private fb: FormBuilder,
    private rotaService: RotaService,
    private userOptionsService: UserOptionsService,
    private snackbar: SnackbarService,
    private rotaSettings: RotaSettingsService
  ) {

    this.rotaDayForm = this.fb.array([]);

    route.params.pipe(takeUntil(this.ngUnsubscribe)).subscribe(() => {
      
      if(route.snapshot.params.rotationPeriodId){

          this.rotationPeriodId = Number(`${route.snapshot.params.rotationPeriodId}`);

      }

  });

  }

  ngOnInit() {

    this.rotaSettings.getRotationAreas(false).subscribe(areas => this.areas = areas);
    this.setSelectedAreas();
    this.loadRotaDays();
    
  }
  
  loadRotaDays() : void {

    this.rotaService.getRotaDayAssignmentsByRotationPeriodId(this.rotationPeriodId).then(rotaDays => {
      if(rotaDays){
        this.processRotaDays(rotaDays);
      }
    });

  }

  setSelectedAreas() : void {

    this.userOptionsService.getUserPreferences().pipe(take(1)).subscribe(preferences => {

      this.areaForm.get('areas')?.setValue(preferences?.rotaAreas);

    })

  }

  processRotaDays(rotaDays: RotaDayAssignmentResponse) : void { 
    
    this.rotaDays = new BehaviorSubject<RotaDay[]>(rotaDays.rotaDays);

    this.rotaDayForm.clear();

    for(let day of rotaDays?.rotaDays){
      let dayGroup = this.generateRotaDay(day);
      this.rotaDayForm.push(dayGroup);
    }

  }

  generateRotaDay(day: RotaDay) : FormGroup {

    let rotaGroup = this.fb.group({
      rotaDayDate: [day.rotaDayDate],      
      rotaDayAssignments: this.fb.array([])
    });    

    for(let assignment of day.rotaDayAssignments){
      
      if(!this.selectedAreas.find(area => area === assignment.rotationAreaId)){
        continue;        
      }

      let assignments: ModelFormGroup<RotaDayAssignment> = this.fb.nonNullable.group({
        rotaDayId :             [assignment.rotaDayId],
        areaRowSpan :           [assignment.areaRowSpan],
        areaShiftId :           [assignment.areaShiftId],
        userId :                [assignment.userId],
        rotationUserId :        [assignment.rotationUserId],
        leaveRequestId :        [assignment.leaveRequestId],
        rotationRole :          [assignment.rotationRole],
        rotationAreaId :        [assignment.rotationAreaId],
        rotationArea :          [assignment.rotationArea],
        rotationAreaColour :    [assignment.rotationAreaColour],
        rotationAreaSortOrder : [assignment.rotationAreaSortOrder],
        plannedShiftStartTime : [assignment.plannedShiftStartTime],
        plannedShiftEndTime :   [assignment.plannedShiftEndTime],
        actualShiftStartTime :  [assignment.actualShiftStartTime],
        actualShiftEndTime :    [assignment.actualShiftEndTime],
        notes :                 [assignment.notes] 
      });

      (rotaGroup.get('rotaDayAssignments') as FormArray)?.push(assignments);

    }

    return rotaGroup;

  }

  areaSelected() : void {
    const selectedAreas = this.areaForm.get('areas')?.value;

    this.userOptionsService.getUserPreferences().pipe(take(1)).subscribe(preferences => {
      preferences.rotaAreas = selectedAreas || [];

      this.userOptionsService.updateUserPreferences(preferences).then(response => {

        response.success === 1 ?
        this.snackbar.successSnackBar("Areas saved to preferences","OK") :
        this.snackbar.errorSnackBar("Save failed - error: DRC-124","OK");
      });

    })
  }


}
