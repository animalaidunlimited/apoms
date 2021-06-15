import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
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
  isAssigned: any;
  isComplete: any;

  constructor( private fb: FormBuilder,
    private dropdowns: DropdownService,
    private driverView: DriverViewService) { }

  ngOnInit(): void {

    this.driverViewDetails = this.fb.group({
      assignmentDate: [getCurrentTimeString()],
      secondaryRescuerId: []
    });

    this.loadDriverDetails();
    
    this.rescuers$ = this.dropdowns.getRescuers();
  

  }

  loadDriverDetails() {
    console.log('Hi')
    this.driverViewDetails.get('assignmentDate')?.setValue(getCurrentTimeString());

    console.log(this.driverViewDetails.get('assignmentDate')?.value);

    this.driverViewDetails.get('assignmentDate')?.valueChanges.subscribe(date=> {

      this.driverViewList$ = this.driverView.getDriverViewDetails(date);
      this.driverViewList$.subscribe(item=> {
        console.log(item);
        this.inProgressStatusList = item.filter((dataItem: any)=> dataItem.ActionStatus === 'In Progress');
        this.inAmbulaneStatusList = item.filter((dataItem: any)=> dataItem.ActionStatus === 'In Ambulance');
        this.isAssigned = item.filter((dataItem: any)=> dataItem.ActionStatus === 'Assigned');
        this.isComplete = item.filter((dataItem: any)=> dataItem.ActionStatus === 'Complete');
      })
    });
    
   

  }
  

}
