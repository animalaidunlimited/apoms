import { Component, inject, OnInit } from '@angular/core';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { RotaService } from '../../../../services/rota.service';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { Observable } from 'rxjs';
import { UserAssignmentPrintItem } from 'src/app/core/models/rota';
import { MaterialModule } from 'src/app/material-module';
import { CommonModule, DatePipe } from '@angular/common';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-staff-schedule-print',
  imports: [CommonModule, MaterialModule],
  
templateUrl: './staff-schedule-print.component.html',
  styleUrls: ['./staff-schedule-print.component.scss']
})
export class StaffSchedulePrintComponent implements OnInit {

  assignments: Observable<UserAssignmentPrintItem[]>;
  rotaService = inject(RotaService);
  rotaDayDate = new Date();

  displayedColumns = ["staff", "area", "start", "end", "notes"]

  constructor(
    private route: ActivatedRoute,
    private userDetails: UserDetailsService,
    private printService: PrintTemplateService,
    private datepipe: DatePipe
  ) { 
    const day = JSON.parse(route.snapshot.params?.staffScheduleDay);

    this.rotaDayDate = new Date(day.selectedDate);

    this.assignments = this.rotaService.getRotaDayAssignmentsForDay(day.selectedDate)
                                          .pipe(map(assignments => {

                                            if(!assignments) return [];

                                            return assignments.rotaDayAssignments
                                                                  .filter(assignment => assignment.userId)
                                                                  .map(assignment => {

                                                                    let user = this.userDetails.getUser(assignment.userId);

                                                                    return {
                                                                      userId: assignment.userId,
                                                                      employeeNumber: user?.employeeNumber || "",
                                                                      firstName: user?.firstName || "",
                                                                      localName: user?.localName || "",
                                                                      notes: assignment.notes,
                                                                      startTime: this.getAMPMFrom24hr(assignment?.actualStartTime) || assignment?.plannedStartTime,
                                                                      endTime: this.getAMPMFrom24hr(assignment?.actualEndTime) || assignment?.plannedEndTime,
                                                                      rotationAreaPosition: assignment.rotationAreaPosition || assignment.plannedRotationAreaPosition

                                                                    }

                                                                  })
                                                                  .sort(this.sortUserAssignments)


                                          }))

    this.printService.onDataReady('print-staff-schedule-day');
  }

  ngOnInit() {

  }


  private sortUserAssignments(a: UserAssignmentPrintItem, b: UserAssignmentPrintItem) : number {

    const employeeNumberCompare =  a.employeeNumber.localeCompare(
      b.employeeNumber,
      undefined,
      {numeric : true, sensitivity: 'base'}
    );

    if(employeeNumberCompare !== 0){
      return employeeNumberCompare;
    }    

    return new Date(`2023-01-01 ${a.startTime}`).getTime() - new Date(`2023-01-01 ${b.startTime}`).getTime()

  }

  private getAMPMFrom24hr(currentTime: string) : string | null {

    if(!currentTime){
      return "";
    }

    const currentTimeDate = new Date(`2023-01-01 ${currentTime}`);

    return this.datepipe.transform(currentTimeDate, 'hh:mm a');

  }

}
