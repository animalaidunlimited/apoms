import { state } from '@angular/animations';
import { S } from '@angular/cdk/keycodes';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { exhaustMap, flatMap, last, map, mergeMap, switchMap } from 'rxjs/operators';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
import { DriverAssignments } from 'src/app/core/models/driver-view';
import { User } from 'src/app/core/models/user';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { DriverViewService } from '../../services/driver-view.service';

@Component({
  selector: 'app-driver-view',
  templateUrl: './driver-view.component.html',
  styleUrls: ['./driver-view.component.scss']
})
export class DriverViewComponent implements OnInit {

  driverViewDetails!: FormGroup;
  rescuers$!: Observable<User[]>;
  statusList!: any;
  states!: any;
  showComplete = false;

  constructor( private fb: FormBuilder,
    private driverView: DriverViewService,
    private dropDown: DropdownService,
    private router: Router) { }

  ngOnInit(): void {

    this.driverViewDetails = this.fb.group({
      assignmentDate: [getCurrentTimeString()],
      secondaryRescuerId: []
    });

    this.loadDriverDetails();

    this.dropDown.getCallOutcomes();

    this.dropDown.getTreatmentAreas();
  }

  loadDriverDetails() {

    this.populateDriverView(this.driverViewDetails.get('assignmentDate')?.value);

    this.driverViewDetails.get('assignmentDate')?.valueChanges.subscribe(date=> {
      if(date) {
        this.populateDriverView(date);
      }
    });

    this.driverView.getDriverViewQuestions();



  }

  populateDriverView(date: any) {
    this.driverView.populateDriverView(date);

    this.states = this.driverView.driverViewDetails.pipe(map(driverAssignments=> {
     
      const statesList = new Set(driverAssignments.map(assignments=> assignments.actionStatus));
      return statesList;
    }));

  }

  
  showCompleteList() {

    this.showComplete = !this.showComplete;
  }

  openMapComponent() {
    this.router.navigate(['/nav/case-location']);
  }


}
