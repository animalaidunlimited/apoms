import { Component, inject, OnInit } from '@angular/core';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { RotaService } from '../../services/rota.service';
import { PrintTemplateService } from 'src/app/modules/print-templates/services/print-template.service';
import { Observable } from 'rxjs';
import { UserAssignmentPrintItem } from 'src/app/core/models/rota';
import { MaterialModule } from 'src/app/material-module';
import { CommonModule } from '@angular/common';
import { map } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-daily-rota-print',
  imports: [CommonModule, MaterialModule],
  
templateUrl: './daily-rota-print.component.html',
  styleUrls: ['./daily-rota-print.component.scss']
})
export class DailyRotaPrintComponent implements OnInit {

  assignments: Observable<UserAssignmentPrintItem[]>;
  rotaService = inject(RotaService);
  rotaDayDate = new Date();

  displayedColumns = ["staff", "area", "start", "end", "notes"]

  constructor(
    private route: ActivatedRoute,
    private userDetails: UserDetailsService,
    private printService: PrintTemplateService
  ) { 
    const day = JSON.parse(route.snapshot.params?.dailyRotaDay);

    this.rotaDayDate = new Date(day.selectedDate);

    this.assignments = this.rotaService.getRotaDayAssignmentsForDay(day.selectedDate)
                                          .pipe(map(assignments => {

                                            if(!assignments) return [];

                                            return assignments.rotaDayAssignments
                                                                  .filter(assignment => assignment.userId)
                                                                  .map(assignment => {

                                                                    let user = this.userDetails.getUser(assignment.userId)

                                                                    const workTime = assignment.rotationRoleShiftSegments.find(segment => segment.shiftSegmentTypeId === 1);

                                                                    return {
                                                                      userId: assignment.userId,
                                                                      employeeNumber: user?.employeeNumber || "",
                                                                      firstName: user?.firstName || "",
                                                                      localName: user?.localName || "",
                                                                      notes: assignment.notes,
                                                                      startTime: new Date(day.selectedDate + 'T' + workTime?.startTime),
                                                                      endTime: new Date(day.selectedDate + 'T' + workTime?.endTime),
                                                                      rotationArea: assignment.rotationArea,
                                                                      rotationRoleShiftSegments: assignment.rotationRoleShiftSegments
                                                                    }

                                                                  })
                                                                  .sort((a,b) => a.employeeNumber.localeCompare(
                                                                    b.employeeNumber,
                                                                    undefined,
                                                                    {numeric : true, sensitivity: 'base'}
                                                                  ))


                                          }))

    this.printService.onDataReady('print-daily-rota-day');
  }

  ngOnInit() {

  }

}
