import { state } from '@angular/animations';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { getCurrentTimeString } from 'src/app/core/helpers/utils';
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
  driverViewList$!: Observable<any>;
  inProgressStatusList: any;
  inAmbulaneStatusList: any;
  assignedList: any;
  completeList: any;
  showComplete = false;

  constructor( private fb: FormBuilder,
    private dropdowns: DropdownService,
    private driverView: DriverViewService,
    private router: Router) { }

  ngOnInit(): void {

    this.driverViewDetails = this.fb.group({
      assignmentDate: [getCurrentTimeString()],
      secondaryRescuerId: []
    });

    this.loadDriverDetails();
    
    this.rescuers$ = this.dropdowns.getRescuers();
  

  }

  loadDriverDetails() {
    this.driverViewDetails.get('assignmentDate')?.setValue(getCurrentTimeString());

    this.driverViewDetails.get('assignmentDate')?.valueChanges.subscribe(date=> {

      this.driverViewList$ = this.driverView.getDriverViewDetails(date);
      this.driverViewList$.subscribe(item=> {
        console.log(item);
        this.inProgressStatusList = item.filter((dataItem: any)=> dataItem.actionStatus === 'In Progress');
        this.inAmbulaneStatusList = item.filter((dataItem: any)=> dataItem.actionStatus === 'In Ambulance');
        this.assignedList = item.filter((dataItem: any)=> dataItem.actionStatus === 'Assigned');
        this.completeList = item.filter((dataItem: any)=> dataItem.actionStatus === 'Complete');
      })
    });

  }

  changeRoute(completeList: any) {
    this.router.navigate(['/nav/completed-assignments'], {state: {data: completeList}});

  }
  

}
