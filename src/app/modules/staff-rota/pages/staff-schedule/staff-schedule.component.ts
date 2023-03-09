import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { skip, take, takeUntil } from 'rxjs/operators';
import { RotaService } from '../../services/rota.service';
import { LeaveRequest, Rota, RotaDay, RotaDayAssignmentResponse, RotationArea, RotationPeriodResponse, RotaVersion,
         ScheduleAuthorisation, ScheduleAuthorisationDay, ScheduleManagerAuthorisation } from '../../../../core/models/rota';
import { RotaSettingsService } from '../settings/services/rota-settings.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { SnackbarService } from '../../../../core/services/snackbar/snackbar.service';
import { StaffScheduleService } from '../../services/staff-schedule.service';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { LeaveRequestService } from '../../services/leave-request.service';


@Component({
  selector: 'app-staff-schedule',
  templateUrl: './staff-schedule.component.html',
  styleUrls: ['./staff-schedule.component.scss']
})
export class StaffScheduleComponent implements OnInit {

  private ngUnsubscribe = new Subject();

  areaForm = this.fb.group({
    areas: new FormControl<number[] | undefined>(undefined),
    rotaId: new FormControl<number | null>(null, Validators.required),
    rotaVersionId: new FormControl<number | null>({ value: null, disabled: true })
  });

  areas: RotationArea[] = [];

  currentScheduleAuthorisation = new BehaviorSubject<ScheduleAuthorisationDay>({} as ScheduleAuthorisationDay);

  dataLoading = false;

  leaveRequests = new BehaviorSubject<LeaveRequest[] | null>(null);

  offset = 0;

  rotaDayForm: FormArray;

  rotaDays = new BehaviorSubject<RotaDay[]>([]);
  rotas : Observable<Rota[] | null>;
  rotaVersions = new BehaviorSubject<RotaVersion[] | null>(null);

  rotationPeriodId: number = -1;

  selectedIndex = 0;

  scheduleAuthorisation : ScheduleManagerAuthorisation | null = null;

  showScheduleAuthorisation = false;

  showWeek = true; 

  startDate: Date | undefined;
  endDate: Date | undefined;

  rightDisabled = true;
  leftDisabled = true;

  previous = 1;
  next = -1;

  get getRotaVersionId(): number | null | undefined{
    return this.areaForm.get('rotaVersionId')?.value;
  } 

  get selectedAreas(): number[] {
    return this.areaForm.get('areas')?.value || [];
  }


  constructor(
    route: ActivatedRoute,
    private fb: FormBuilder,
    private requestService: LeaveRequestService,
    private rotaService: RotaService,
    private staffScheduleService: StaffScheduleService,
    private userOptionsService: UserOptionsService,
    private snackbar: SnackbarService,
    private printService: PrintTemplateService,
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
    this.watchRotaSelect();
    this.watchLeaveRequests();
    
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
            this.dataLoading = true;            
            this.getRotationPeriodForRotaVersion(defaultRotaVersion.rotaVersionId);
          }
        }

      })
      
    );
    
  }

  getRotationPeriodForRotaVersion(rotaVersionId: number, limit?: number, offset?: number) : void {

    this.rotaService.getRotationPeriods(rotaVersionId, limit, offset, 1).then(response => {

      if(!response){
        return;
      }

      this.processRotationPeriodResponse(response, true);
      

    })

  }
  
  private processRotationPeriodResponse(response: RotationPeriodResponse | null, loadRotaDays: boolean) {

    if(!response) return;

    const currentPeriod = response?.rotationPeriods[0];

    this.startDate = new Date(currentPeriod.startDate);
    this.endDate = new Date(currentPeriod.endDate);

    this.leftDisabled = currentPeriod.rotationPeriodGUID === response.firstRotationPeriodGUID;

    this.rotationPeriodId = currentPeriod.rotationPeriodId;

    this.requestService.getLeaveRequestsForPeriod(currentPeriod.startDate.toString(), currentPeriod.endDate.toString()).then(requests => {

      this.leaveRequests.next(requests);

      if(loadRotaDays) this.loadRotaDays();

    });
  }
  
  loadRotaDays() : void {
    
    console.log('here');

    if(this.rotationPeriodId === -1){
      this.dataLoading = false;
      return;
    }

    this.dataLoading = true;
    

    this.rotaService.getRotaDayAssignmentsByRotationPeriodId(this.rotationPeriodId);
    
    this.rotaService.rotaDays$.subscribe(rotaDays => {

      if(!rotaDays) return;

      if(!this.areaForm.get('rotaId')?.value){

        this.areaForm.get('rotaId')?.setValue(rotaDays.rotaId, {emitEvent: false});

        this.rotas.pipe(take(1)).subscribe(rotas => { 

          const foundRotaVersions = rotas?.find(element => element.rotaId === rotaDays.rotaId)?.rotaVersions;
  
          if(foundRotaVersions){
            this.rotaVersions.next(foundRotaVersions);
            this.areaForm.get('rotaVersionId')?.enable();
            this.areaForm.get('rotaVersionId')?.setValue(rotaDays.rotaVersionId);
            this.rotaService.getRotationPeriod(rotaDays.rotaVersionId, this.rotationPeriodId).then(response => this.processRotationPeriodResponse(response, false));
            
          }
  
        })

      }  
      
      this.processRotaDays(rotaDays);

      this.loadScheduleManagerAuthorisation();
      
    });

  }

  loadScheduleManagerAuthorisation() : void {

    this.staffScheduleService.getScheduleManagerAuthorisation(this.rotationPeriodId).then(authorisation => {

      this.scheduleAuthorisation = authorisation;
      this.setCurrentScheduleAuthorisation();

    });

    

  }

  setSelectedAreas() : void {

    this.userOptionsService.getUserPreferences().pipe(take(1)).subscribe(preferences => {

      this.areaForm.get('areas')?.setValue(preferences?.rotaAreas);

    })

  }

  watchLeaveRequests() : void {

    this.leaveRequests.pipe(takeUntil(this.ngUnsubscribe), skip(1), take(1)).subscribe(requests => {

      this.rotaDayForm.controls.forEach(day => {        

        const date = new Date(day.get('rotaDayDate')?.value);
        
        const pendingRequests = requests?.filter(request => {

          const startDate = new Date(request.leaveStartDate || day.get('rotaDayDate')?.value);
          const endDate = new Date(request.leaveEndDate || day.get('rotaDayDate')?.value);

          return date >= startDate && date <= endDate && request.granted === null;

        });

        day.get('leaveRequestCount')?.setValue(pendingRequests?.length);

      })

    });

  }

  processRotaDays(rotaDays: RotaDayAssignmentResponse) : void { 

    if(!rotaDays) return;

    rotaDays.rotaDays.sort((a,b) => new Date(a.rotaDayDate).getTime() - new Date(b.rotaDayDate).getTime())

    this.rotaDays.next(rotaDays.rotaDays);

    this.rotaDayForm.clear();

    for(let day of rotaDays?.rotaDays){
      let dayGroup = this.generateRotaDay(day);

      this.rotaDayForm.push(dayGroup);
    }

    this.dataLoading = false;
    console.log('Now here');

  }

  generateRotaDay(day: RotaDay) : FormGroup {

    let rotaGroup = this.fb.group({
      rotaDayDate: [day.rotaDayDate],
      leaveRequestCount: [0],
      rotaDayAssignments: this.fb.array([])
    });

    for(let assignment of day.rotaDayAssignments){

      let newAssignment = this.staffScheduleService.generateNewAssignment(assignment);

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
        this.snackbar.errorSnackBar("Save failed - error: SSC-313","OK");
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

printRotaDay() : void {

  const rotaDayObject = {
    selectedDate: this.getSelectedRotaDay()
  };

  this.printService.sendRotaDayToPrinter(JSON.stringify(rotaDayObject));

}

showAuthorisation() : void {

  this.showScheduleAuthorisation = !this.showScheduleAuthorisation;

  this.setCurrentScheduleAuthorisation();


}

private setCurrentScheduleAuthorisation() {
  let foundRotaDay = this.getCurrentScheduleAuthorisation();

  if (foundRotaDay) {
    this.currentScheduleAuthorisation.next(foundRotaDay);
  }
}

getCurrentScheduleAuthorisation() : ScheduleAuthorisationDay | undefined{

  let foundScheduleAuthorisation = this.scheduleAuthorisation?.scheduleAuthorisation.find(rotaDay => rotaDay.rotaDayDate === this.getSelectedRotaDay());

  this.setAuthorisedCounts(foundScheduleAuthorisation);

  return foundScheduleAuthorisation;

}

  private setAuthorisedCounts(foundScheduleAuthorisation: ScheduleAuthorisationDay | undefined) {
    if (foundScheduleAuthorisation) {

      foundScheduleAuthorisation.managerCount = foundScheduleAuthorisation?.authorisation.length || 0;
      foundScheduleAuthorisation.authorisedCount = foundScheduleAuthorisation?.authorisation.filter(element => element.authorised)?.length || 0;

    }
  }

getSelectedRotaDay() : string {

  return this.rotaDayForm.controls.at(this.selectedIndex)?.get('rotaDayDate')?.value;

}

tabChanged($event: MatTabChangeEvent) : void {
  this.selectedIndex = $event.index;
  this.showScheduleAuthorisation = false;
}

showLeaveRequestsForDay(leaveDate: string | Date) : void {
  console.log(leaveDate);
}

toggleShowWeek() : void {
  this.showWeek = !this.showWeek;
}

updateManagerAuthorisation(authorisation: ScheduleAuthorisation) : void {

  const currentAuthorisation = this.getCurrentScheduleAuthorisation();

  let foundAuthorisation = currentAuthorisation?.authorisation.find(element => element.scheduleManagerId === authorisation.scheduleManagerId);

  if(foundAuthorisation && currentAuthorisation){

    foundAuthorisation.authorised = !authorisation.authorised;
    this.setAuthorisedCounts(currentAuthorisation);

    this.staffScheduleService.updateScheduleManagerAuthorisation(currentAuthorisation).then(response => {

      if(response.success === -1){
        this.snackbar.errorSnackBar("Save failed - error: SSC-392","OK");
      }

    })
  }

}

}
