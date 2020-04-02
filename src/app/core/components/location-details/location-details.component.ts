import { Component, OnInit, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { CrossFieldErrorMatcher } from '../../../core/validators/cross-field-error-matcher';
import { FormGroup, Validators, FormBuilder, AbstractControl } from '@angular/forms';
import { Location, LocationResponse } from '../../models/responses';

import { UserOptionsService } from '../../services/user-options.service';

import { LocationDetailsService } from './location-details.service';

export interface position{
  lat: number;
  lng: number
}

export interface marker {
	position: position;
	label?: string;
	options: any;
}

@Component({
  selector: 'location-details',
  templateUrl: './location-details.component.html',
  styleUrls: ['./location-details.component.scss']
})

export class LocationDetailsComponent implements OnInit {

  @Input() recordForm: FormGroup;

  errorMatcher = new CrossFieldErrorMatcher();

  mapTypeId: google.maps.MapTypeId;
  center: google.maps.LatLngLiteral

  constructor(
    private locationService: LocationDetailsService,
    private fb: FormBuilder,
    private userOptions: UserOptionsService) { }

  zoom: number;
  latitude: AbstractControl;
  longitude: AbstractControl;

  location$: Location;

  markers: marker[] = [];


  @Output() setAddress: EventEmitter<any> = new EventEmitter();
  @ViewChild('addressSearch') addresstext: any;

  ngOnInit() {

    this.recordForm.addControl(
      "locationDetails", this.fb.group({
        location: ["", Validators.required],
        latitude: ["", Validators.required],
        longitude: ["", Validators.required],
      })
    );



    this.locationService.getLocationByEmergencyCaseId(this.recordForm.get("emergencyDetails.emergencyCaseId").value)
    .subscribe((location: LocationResponse) => {

      this.recordForm.patchValue(location);

        if(location.locationDetails){
          this.initialiseLocation(location.locationDetails);
          this.updateLocation(location.locationDetails.latitude, location.locationDetails.longitude);
        }

    });

    if(this.recordForm.get("locationDetails.latitude").value == ""){

      let coordinates = this.userOptions.getCoordinates() as Location;
      this.initialiseLocation(coordinates);
    }
  }


  ngAfterViewInit() {

    this.getPlaceAutocomplete();

    //TODO review this after the below issue is closed:
    //https://github.com/angular/components/pull/18967
    this.mapTypeId = google.maps.MapTypeId.ROADMAP;
}

getPlaceAutocomplete() {
    const autocomplete = new google.maps.places.Autocomplete(this.addresstext.nativeElement,
        {
          //TODO update this based on the settings of the user
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

    this.recordForm.get("locationDetails.location").setValue(result.formatted_address);

    this.updateLocation(result.geometry.location.lat(), result.geometry.location.lng());
}

initialiseLocation(coordinates:Location){

  this.zoom = 13;

  this.markers = [];

  let marker:marker = {
    position: {lat : coordinates.latitude, lng : coordinates.longitude},
    label: "",
    options: {draggable: true}
  }

  this.markers.push(marker);
  this.updateLocation(coordinates.latitude, coordinates.longitude);
}

  updateLocation(latitude:number, longitude:number)
  {
    this.recordForm.get("locationDetails.latitude").setValue(latitude);
    this.recordForm.get("locationDetails.longitude").setValue(longitude);

    this.markers[0].position = {lat: latitude, lng: longitude}

    this.center = {lat : latitude, lng : longitude};
  }

  markerDragEnd(event: google.maps.MouseEvent)
  {
    let position = event.latLng.toJSON();
    this.recordForm.get("locationDetails.latitude").setValue(position.lat);
    this.recordForm.get("locationDetails.longitude").setValue(position.lng);

    this.center = {lat : position.lat, lng : position.lng};
  }

  performSearch()
  {

    const addressSearcher = new google.maps.places.PlacesService(this.addresstext.nativeElement);

    var searchRequest = {
      query: this.recordForm.get("locationDetails.location").value,
      fields: ['name', 'geometry', 'formatted_address'],
    };

    addressSearcher.findPlaceFromQuery(searchRequest,(results, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        for (var i = 0; i < results.length; i++) {

          // this.recordForm.get("locationDetails.location").setValue(results[0].formatted_address);
          this.updateLocation(results[0].geometry.location.lat(), results[0].geometry.location.lng());

        }
      }
    });



  }

}
