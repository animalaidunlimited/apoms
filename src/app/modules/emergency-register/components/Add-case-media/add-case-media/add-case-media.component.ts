import { Component, OnInit } from '@angular/core';
import { OutstandingCase } from 'src/app/core/models/outstanding-case';
import { BehaviorSubject } from 'rxjs';
import { OutstandingCaseService } from 'src/app/modules/emergency-register/services/outstanding-case.service';
import { EmergencyRegisterTabBarService } from '../../../services/emergency-register-tab-bar.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'add-case-media',
  templateUrl: './add-case-media.component.html',
  styleUrls: ['./add-case-media.component.scss']
})
export class AddCaseMediaComponent implements OnInit {

  outstandingCases!:OutstandingCase[];
  outstandingCases$!:BehaviorSubject<OutstandingCase[]>;
  constructor(
    private outstandingCaseService: OutstandingCaseService,
  ) { }

  ngOnInit(): void {
  }

}
