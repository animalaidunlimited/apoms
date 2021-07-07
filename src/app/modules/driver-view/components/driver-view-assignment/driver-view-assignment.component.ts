import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { DriverAssignments } from 'src/app/core/models/driver-view';
import { DriverViewService } from '../../services/driver-view.service';

@Component({
  selector: 'app-driver-view-assignment',
  templateUrl: './driver-view-assignment.component.html',
  styleUrls: ['./driver-view-assignment.component.scss']
})
export class DriverViewAssignmentComponent implements OnInit {

  @Input() actionStatus!: string;
  @Input() showCompleteFlag!: any;
  driverViewAssignments!: Observable<DriverAssignments[]>; 

  constructor(private driverView: DriverViewService ) { }

  ngOnInit(): void {

    this.driverViewAssignments = this.driverView.getAssignmentByStatus(this.actionStatus);
    console.log(this.showCompleteFlag);
  }

}
