import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CrossFieldErrorMatcher } from '../../../core/validators/cross-field-error-matcher';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { map, startWith } from 'rxjs/operators';

import { UserOptionsService } from '../../services/user-options.service';

import {Location, Appearance} from '@angular-material-extensions/google-maps-autocomplete';


import PlaceResult = google.maps.places.PlaceResult;


export interface marker {
	latitude: number;
	longitude: number;
	label?: string;
	draggable: boolean;
}

@Component({
  selector: 'location-details',
  templateUrl: './location-details.component.html',
  styleUrls: ['./location-details.component.scss']
})

export class LocationDetailsComponent implements OnInit {

  @Input() recordForm: FormGroup;

  errorMatcher = new CrossFieldErrorMatcher();

  constructor(private dropdowns: DropdownService,
    private fb: FormBuilder,
    private userOptions: UserOptionsService) { }

  areas;
  filteredAreas;
  animalArea;

  appearance = Appearance;
  zoom: number;
  latitude: number;
  longitude: number;
  selectedAddress: PlaceResult;
  markers: marker[] = [];

  private _filter(value): any[] {
    const filterValue = value.toLowerCase();

    return this.areas.filter(option => option.areaName.toLowerCase().includes(filterValue));
  }

  ngOnInit() {

    var b = 0;

    this.recordForm.addControl(
      "locationDetails", this.fb.group({
        animalArea: ['', Validators.required],
        animalLocation: ['', Validators.required],
        latitude: ['', Validators.required],
        longitude: ['', Validators.required],
      })
    );

    let coordinates = this.userOptions.getCoordinates() as Location;
    this.latitude = coordinates.latitude;
    this.longitude = coordinates.longitude;
    this.zoom = 13;

    this.areas = this.dropdowns.getAreas();

    this.animalArea = this.recordForm.get("locationDetails.animalArea");

    this.filteredAreas = this.animalArea.valueChanges
    .pipe(
      startWith(''),
      map(area => this._filter(area))
    );
  }

  initMarkerArray(latitude:number, longitude:number)
  {
    let marker:marker = {
      latitude: latitude,
      longitude: longitude,
      label: "",
      draggable: true
    }

    this.markers.push(marker);
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

  onAutocompleteSelected(result: PlaceResult) {
  }

  onLocationSelected(location: Location) {
    this.latitude = location.latitude;
    this.longitude = location.longitude;

    if(this.markers.length === 0)
    {
      this.initMarkerArray(location.latitude, location.longitude);
    }

    this.markers[0].latitude = location.latitude;
    this.markers[0].longitude = location.longitude;

  }

  markerDragEnd(marker, $event)
  {
    this.latitude = marker.latitude;
    this.longitude = marker.longitude;
  }



}
