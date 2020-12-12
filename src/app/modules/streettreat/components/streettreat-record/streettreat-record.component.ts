import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { StreetTreatTab } from 'src/app/core/models/streettreet';

@Component({
  selector: 'app-streettreat-record',
  templateUrl: './streettreat-record.component.html',
  styleUrls: ['./streettreat-record.component.scss']
})
export class StreetTreatRecordComponent implements OnInit {
  recordForm: FormGroup = new FormGroup({});
  @Input() inputStreetTreatCase!: StreetTreatTab;
  constructor() { }

  ngOnInit(): void {
    
  }

}
