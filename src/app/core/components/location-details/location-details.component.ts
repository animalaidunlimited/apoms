import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { CrossFieldErrorMatcher } from '../../../core/validators/cross-field-error-matcher';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { map, startWith } from 'rxjs/operators';

import { UserOptionsService } from '../../services/user-options.service';

import {Location, Appearance} from '@angular-material-extensions/google-maps-autocomplete';

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

  zoom: number;
  latitude: AbstractControl;
  longitude: AbstractControl;

  animalLocation;

  markers: marker[] = [];

  @Output() setAddress: EventEmitter<any> = new EventEmitter();
  @ViewChild('addressSearch', {static: false}) addresstext: any;



  ngOnInit() {

    this.recordForm.addControl(
      "locationDetails", this.fb.group({
        animalLocation: ['', Validators.required],
        latitude: ['', Validators.required],
        longitude: ['', Validators.required],
      })
    );

    this.latitude = this.recordForm.get("locationDetails.latitude");
    this.longitude = this.recordForm.get("locationDetails.longitude");
    this.animalLocation = this.recordForm.get("locationDetails.animalLocation");

    let coordinates = this.userOptions.getCoordinates() as Location;
    this.latitude.setValue(coordinates.latitude);
    this.longitude.setValue(coordinates.longitude);
    this.zoom = 13;

    let marker:marker = {
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      label: "",
      draggable: true
    }

    this.markers.push(marker);
  }

  ngAfterViewInit() {

      this.getPlaceAutocomplete();
}

getPlaceAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(this.addresstext.nativeElement,
        {
            componentRestrictions: { country: 'IN' },
            types: ["geocode"]
        });

    google.maps.event.addListener(autocomplete, 'place_changed', () => {
        const place = autocomplete.getPlace();
        this.invokeEvent(place);
    });
}

invokeEvent(place: Object) {
    this.setAddress.emit(place);

    let result = place as google.maps.places.PlaceResult;

    this.updateLocation(result.geometry.location.lat(), result.geometry.location.lng());
}

  updateLocation(iLatitude:number, iLongitude:number)
  {
    this.latitude.setValue(iLatitude);
    this.longitude.setValue(iLongitude);

    this.markers[0].latitude = iLatitude;
    this.markers[0].longitude = iLongitude;
  }

  markerDragEnd(marker, $event)
  {
    this.latitude.setValue(marker.latitude);
    this.longitude.setValue(marker.longitude);
  }

  performSearch($event)
  {

    const addressSearcher = new google.maps.places.PlacesService(this.addresstext.nativeElement);

    var searchRequest = {
      query: this.animalLocation.value,
      fields: ['name', 'geometry'],
    };

    addressSearcher.findPlaceFromQuery(searchRequest,(results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {
          this.updateLocation(results[0].geometry.location.lat(), results[0].geometry.location.lng())
        }
      }
    });

  }

}
