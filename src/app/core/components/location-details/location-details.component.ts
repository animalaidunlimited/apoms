import { Component, OnInit, Input } from '@angular/core';
import { CrossFieldErrorMatcher } from '../../../core/validators/cross-field-error-matcher';
import { FormGroup, Validators } from '@angular/forms';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'location-details',
  templateUrl: './location-details.component.html',
  styleUrls: ['./location-details.component.scss']
})

export class LocationDetailsComponent implements OnInit {

  @Input() recordForm: FormGroup;

  errorMatcher = new CrossFieldErrorMatcher();

  constructor(private dropdowns: DropdownService) { }

  areas;
  filteredAreas;
  animalArea;

  private _filter(value): any[] {
    const filterValue = value.toLowerCase();
  
    return this.areas.filter(option => option.areaName.toLowerCase().includes(filterValue));
  }

  ngOnInit() {

    this.areas = this.dropdowns.getAreas();

    this.animalArea = this.recordForm.get("locationDetails.animalArea");

    this.filteredAreas = this.animalArea.valueChanges
    .pipe(
      startWith(''),
      map(area => this._filter(area))
  
    );
  }

  checkArea()
  {
    let areaExists = this.areas.some(area => {

      return area.areaName == this.animalArea.value;

    })

    if(!areaExists)
    {
      this.animalArea.setErrors({"incorrectAreaEntered" : true});
    }
    
  }

  getAreaName(value): any {

    if(value)
    {
      const results = this.areas.filter(area => area.areaName === value);
  
      if (results.length) {
          return results[0].areaName;
      }
    }
  
    return value;
  
  }

}
