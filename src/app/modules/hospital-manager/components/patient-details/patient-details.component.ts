import { Component, OnInit, Input } from '@angular/core';
import { DropdownService } from '../../../../core/services/dropdown/dropdown.service'
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'patient-details',
  templateUrl: './patient-details.component.html',
  styleUrls: ['./patient-details.component.scss']
})
export class PatientDetailsComponent implements OnInit {

  species;
  @Input() recordForm: FormGroup;

  constructor(private dropdowns: DropdownService) { }

  ngOnInit() {

    this.species = this.dropdowns.getSpecies();
  }
  

}
