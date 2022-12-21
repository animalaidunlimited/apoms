import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { RotaService } from '../../services/rota.service';
import { Rota, RotaDay, RotaDayAssignmentResponse, RotationArea, RotaVersion } from './../../../../core/models/rota';
import { RotaSettingsService } from './../settings/services/rota-settings.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { SnackbarService } from './../../../../core/services/snackbar/snackbar.service';
import { DailyRotaService } from './../../services/daily-rota.service';


@Component({
  selector: 'app-daily-rota',
  templateUrl: './daily-rota.component.html',
  styleUrls: ['./daily-rota.component.scss']
})
export class DailyRotaComponent implements OnInit {

  private ngUnsubscribe = new Subject();

  rotaDayForm: FormArray;

  areaForm = this.fb.group({
    areas: new FormControl<number[] | undefined>(undefined),
    rotaId: new FormControl<number | null>(null, Validators.required),
    rotaVersionId: new FormControl<number | null>({ value: null, disabled: true })
  });

  areas: RotationArea[] = [];

  get selectedAreas(): number[] {
    return this.areaForm.get('areas')?.value || [];
  }

  rotaDays = new BehaviorSubject<RotaDay[]>([]);
  rotas : Observable<Rota[] | null>;
  rotaVersions = new BehaviorSubject<RotaVersion[] | null>(null);

  rotationPeriodId: number = -1;

  startDate: Date | undefined;
  endDate: Date | undefined;

  offset = 0;

  rightDisabled = true;
  leftDisabled = true;

  previous = 1;
  next = -1;

  get getRotaVersionId(): number | null | undefined{
    return this.areaForm.get('rotaVersionId')?.value;
  }


  constructor(
    route: ActivatedRoute,
    private fb: FormBuilder,
    private rotaService: RotaService,
    private dailyRotaService: DailyRotaService,
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

    this.rotas = this.rotaService.getRotas();

  }

  ngOnInit() {

    this.rotaSettings.getRotationAreas(false).subscribe(areas => this.areas = areas);

    this.setSelectedAreas();
    this.loadRotaDays();
    this.watchRotaSelect()
    
  }

  watchRotaSelect() : void
  {
    this.areaForm.get('rotaId')?.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe(rotaId => 
      
      this.rotas.pipe(take(1)).subscribe(rotas => { 

        const foundRotaVersions = rotas?.find(element => element.rotaId === rotaId)?.rotaVersions;

        if(foundRotaVersions){
          this.rotaVersions.next(foundRotaVersions);
          this.areaForm.get('rotaVersionId')?.enable();
  
          const defaultRotaVersion = foundRotaVersions.find(element => element.defaultRotaVersion === true);
  
          if(defaultRotaVersion){
            this.areaForm.get('rotaVersionId')?.setValue(defaultRotaVersion.rotaVersionId);
            this.getRotationPeriodForRotaVersion(defaultRotaVersion.rotaVersionId);
          }
        }

      })
      
    );
    
  }

  getRotationPeriodForRotaVersion(rotaVersionId: number, limit?: number, offset?: number) : void {

    this.rotaService.getRotationPeriods(rotaVersionId, limit, offset).then(result => {

      if(!result){
        return;
      }

      const currentPeriod = result?.rotationPeriods[0];

      this.startDate = new Date(currentPeriod.startDate);
      this.endDate = new Date(currentPeriod.endDate);

      this.leftDisabled = currentPeriod.rotationPeriodGUID === result.firstRotationPeriodGUID;

      this.rotationPeriodId = currentPeriod.rotationPeriodId;
      this.loadRotaDays();

    })

  }
  
  loadRotaDays() : void {

    if(this.rotationPeriodId === -1){
      return;
    }

    this.rotaService.getRotaDayAssignmentsByRotationPeriodId(this.rotationPeriodId).then(rotaDays => {

      if(!rotaDays) return;

      if(!this.areaForm.get('rotaId')?.value){

        this.areaForm.get('rotaId')?.setValue(rotaDays.rotaId, {emitEvent: false});

        this.rotas.pipe(take(1)).subscribe(rotas => { 

          const foundRotaVersions = rotas?.find(element => element.rotaId === rotaDays.rotaId)?.rotaVersions;
  
          if(foundRotaVersions){
            this.rotaVersions.next(foundRotaVersions);
            this.areaForm.get('rotaVersionId')?.enable();

            this.areaForm.get('rotaVersionId')?.setValue(rotaDays.rotaVersionId);
    
            
          }
  
        })

      }

      
      // this.hydrateRotas(rotaDays.rotaId);
      
      //Let's give this a tick to update the rotaId
      // setTimeout(() => {
      //   
        
      // },1);
      
      this.processRotaDays(rotaDays);
      
    });

  }

  setSelectedAreas() : void {

    this.userOptionsService.getUserPreferences().pipe(take(1)).subscribe(preferences => {

      this.areaForm.get('areas')?.setValue(preferences?.rotaAreas);

    })

  }

  processRotaDays(rotaDays: RotaDayAssignmentResponse) : void { 

    if(!rotaDays) return;

    this.rotaDays.next(rotaDays.rotaDays);

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
      
      if(!this.selectedAreas.find(area => area === assignment.rotationAreaId) && assignment.rotationAreaId > 0){
        continue;        
      }

      let newAssignment = this.dailyRotaService.generateNewAssignment(assignment);

      //TODO - FIX THIS AFTER INTRODUCTION OF SHIFT SEGMENTS
      // if(assignment.actualShiftStartTime || assignment.actualShiftEndTime){
      //   newAssignment.get('actualShiftStartTime')?.setValidators([Validators.required, Validators.pattern(/[\S]/)]);
      //   newAssignment.get('actualShiftEndTime')?.setValidators([Validators.required, Validators.pattern(/[\S]/)]);
      // }

      // if(assignment.actualBreakStartTime || assignment.actualBreakEndTime){
      //   newAssignment.get('actualBreakStartTime')?.setValidators([Validators.required, Validators.pattern(/[\S]/)]);
      //   newAssignment.get('actualBreakEndTime')?.setValidators([Validators.required, Validators.pattern(/[\S]/)]);
      // }

      (rotaGroup.get('rotaDayAssignments') as FormArray)?.push(newAssignment);

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
        this.snackbar.errorSnackBar("Save failed - error: DRC-161","OK");
      });

    })
  }

rotaSelected(rotaId: any) : void {

  

}

shiftRotationPeriod(direction: number) : void {

  if(!this.getRotaVersionId){
    return;
  }

  this.offset = this.offset + direction;

  this.getRotationPeriodForRotaVersion(this.getRotaVersionId, 1, this.offset)

}



}
