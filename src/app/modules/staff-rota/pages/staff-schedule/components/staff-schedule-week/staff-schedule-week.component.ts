import { ChangeDetectionStrategy, Component, Input, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormArray, FormBuilder } from '@angular/forms';
import { RotaDayAssignment } from 'src/app/core/models/rota';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { RotaService } from 'src/app/modules/staff-rota/services/rota.service';
import { StaffScheduleService } from 'src/app/modules/staff-rota/services/staff-schedule.service';

@Component({
  selector: 'app-staff-schedule-week',
  templateUrl: './staff-schedule-week.component.html',
  styleUrls: ['./staff-schedule-week.component.scss','../../staff-schedule.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StaffScheduleWeekComponent implements OnInit {

  @Input() inputForm!: FormArray;

  days: string[] = [];

  displayColumns:string[] = [];

  weeklyForm = this.fb.group({
    areaPositions: this.fb.array([])
  });

  get areaPositions() : FormArray {
    return this.weeklyForm?.get('areaPositions') as FormArray;
  }

  constructor(
    private rotaService: RotaService,
    private fb: FormBuilder,
    private snackbar: SnackbarService,
    private changeDetector: ChangeDetectorRef,
    private scheduleService: StaffScheduleService
  ) { }

  ngOnInit() {

    this.rotaService.rotaDays$.subscribe(rotaDays => {

      if(!rotaDays) return;

      this.displayColumns = ["area", "areaPosition"];

      const dataSource = this.scheduleService.generateWeeklyDataSource(rotaDays.rotaDays);
      
      this.weeklyForm.setControl('areaPositions', dataSource);
      
      this.days = this.scheduleService.extractDaysFromRotaDaysArray(rotaDays.rotaDays);      

      this.displayColumns = [...this.displayColumns, ...this.days];

      this.changeDetector.markForCheck();

    });
  }

  userSelected(assignment: RotaDayAssignment) : void {
    
    this.scheduleService.saveAssignment(assignment.rotaDayDate || '', assignment.rotaDayId, assignment).then(response => {

      if(response.success !== 1){

        this.snackbar.errorSnackBar('ERR: SSW-65: Error saving user record', 'OK');

      }

    })

  }

}
