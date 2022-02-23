import { Component,OnInit,Input,ViewChild,Output,EventEmitter,ChangeDetectorRef,AfterViewInit, HostListener, OnDestroy } from '@angular/core';
import { CrossFieldErrorMatcher } from '../../../core/validators/cross-field-error-matcher';
import { FormGroup,Validators,FormBuilder,AbstractControl } from '@angular/forms';
import { Location, LocationResponse } from '../../models/responses';
import { UserOptionsService } from '../../services/user-option/user-options.service';
import { LocationDetailsService } from './location-details.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

export interface Position {
    lat: number;
    lng: number;
}

export interface Marker {
    position: Position;
    label: string;
    options: any;
}

interface LocationFormChanges {
    location: string;
    latitiude: number;
    longitude: number;
}

@Component({
    // tslint:disable-next-line: component-selector
    selector: 'location-details',
    templateUrl: './location-details.component.html',
    styleUrls: ['./location-details.component.scss'],
})
export class LocationDetailsComponent implements OnInit, AfterViewInit, OnDestroy {

    private ngUnsubscribe = new Subject();

    @Input() recordForm!: FormGroup;
    @Output() setAddress: EventEmitter<any> = new EventEmitter();

    @ViewChild('addressSearch', { static: false }) addresstext: any;
    @ViewChild('locationWrapper') locationWrapper: any;
    @ViewChild('googlemap') googlemap: any;

    errorMatcher = new CrossFieldErrorMatcher();
    center!: google.maps.LatLngLiteral;

    removeAddress = false;

    constructor(
        private locationService: LocationDetailsService,
        private fb: FormBuilder,
        private userOptions: UserOptionsService,
        private changeDetector: ChangeDetectorRef
    ) {}


    zoom = 13;
    latitude!: AbstractControl;
    longitude!: AbstractControl;

    mapOptions : google.maps.MapOptions = {};

    location$!: Location;

    markers: Marker[] = [];

    get locationDetails() : FormGroup {
        return this.recordForm.get('locationDetails') as FormGroup;
    }


    @HostListener('document:keydown.control.l', ['$event'])
    focusLocation(event: KeyboardEvent) {
        event.preventDefault();
        this.addresstext.nativeElement.focus();
    }

    ngOnInit() {

        this.mapOptions = {
            streetViewControl: false,
            center: this.center,
			mapId: '587b2567d44623c',
            styles: [
            {
              featureType: 'poi',
              elementType: 'labels',
              stylers: [{visibility: 'off'}]
            }
          ]} as google.maps.MapOptions;

        this.recordForm.addControl(
            'locationDetails',
            this.fb.group({
                location: ['', Validators.required],
                latitude: ['', Validators.required],
                longitude: ['', Validators.required],
            }),
        );

        this.initialiseLocationForm();

        // If there was no lat/long provided initially or the above search didn't return a result, then set to default location.
        this.initialiseLatLong();

        this.locationDetails.valueChanges.pipe(takeUntil(this.ngUnsubscribe)).subscribe((changes: LocationFormChanges) => {

            if(!changes.latitiude && !changes.longitude && !changes.location){
                this.clearAutocomplete();
            }
        });
    }

    private initialiseLatLong() {
        if (!this.latitude || !this.longitude) {

            const coords = this.userOptions.getCoordinates() as google.maps.LatLngLiteral;

            const coordinates: Location = {
                latitude: coords.lat,
                longitude: coords.lng,
                location: ''
            };

            this.initialiseLocation(coordinates);

        }
    }

    private initialiseLocationForm() {

        this.locationService
            .getLocationByEmergencyCaseId(this.recordForm.get('emergencyDetails.emergencyCaseId')?.value)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe((location: LocationResponse) => {
                this.recordForm.patchValue(location);


                // If we have the lat and long then update the location
                if (location.locationDetails?.latitude && location.locationDetails?.longitude) {

                    this.initialiseLocation(location.locationDetails);
                    this.updateLocation(
                        location.locationDetails.latitude,
                        location.locationDetails.longitude
                    );
                }

                // Sometimes for older records we might have the address, but no lat long. In this case, search for the location
                // If no results are found then set the location to be the center of user's lat/long.
                if ((!location.locationDetails?.latitude || !location.locationDetails?.longitude) && location.locationDetails?.location) {

                    this.performSearch(null);
                }

            });
    }

    ngAfterViewInit() {

      this.getPlaceAutocomplete();
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next();
        this.ngUnsubscribe.complete();
    }

    getPlaceAutocomplete() {

        const cityCircle = new google.maps.Circle({
            center: this.center,
            radius: 20000,
          });

        let bounds = cityCircle.getBounds();

        const autocomplete = new google.maps.places.Autocomplete(
            this.addresstext.nativeElement,
            {
                // TODO update this based on the settings of the user
                componentRestrictions: { country: 'IN' },
                types: ['geocode'],
                fields: ['name', 'geometry', 'formatted_address']
            }
        );

        if(bounds){
            autocomplete.setBounds(bounds);
        }

        google.maps.event.addListener(autocomplete, 'place_changed', () => {
            const place = autocomplete.getPlace();


            if(place?.formatted_address){
                this.invokeEvent(place);
            }
        });

    }

    invokeEvent(place: any) {

        this.setAddress.emit(place);

        const result = place as google.maps.places.PlaceResult;

        this.recordForm.get('locationDetails.location')?.setValue(result.formatted_address);

        if(result.geometry?.location){

            this.updateLocation(
                result.geometry.location.lat(),
                result.geometry.location.lng(),
            );
        }

        this.clearAutocomplete();


    }

    // The Google maps Autocomplete isn't meant to be used on a page that has data cleared from it.
    clearAutocomplete() : void {

        this.removeAddress = !this.removeAddress;

        setTimeout(() => {
        this.removeAddress = !this.removeAddress;
        this.changeDetector.detectChanges();
        this.getPlaceAutocomplete();
        this.initialiseLatLong();
        },0);

    }

    initialiseLocation(coordinates: Location) {
        this.zoom = 13;

        this.markers = [];

        const marker: Marker = {
            position: { lat: coordinates.latitude, lng: coordinates.longitude },
            label: '',
            options: { draggable: true },
        };

        this.markers.push(marker);
        this.updateLocation(coordinates.latitude, coordinates.longitude);
    }

    updateLocation(latitude: number, longitude: number) {

        this.recordForm.get('locationDetails.latitude')?.setValue(latitude);
        this.recordForm.get('locationDetails.longitude')?.setValue(longitude);

        this.markers[0].position = { lat: latitude, lng: longitude };

        this.center = { lat: latitude, lng: longitude };

        this.changeDetector.detectChanges();
    }

    markerDragEnd(event: google.maps.MapMouseEvent) {

        if(!event.latLng){
            return;
        }

        const position = event.latLng.toJSON();
        this.recordForm.get('locationDetails.latitude')?.setValue(position.lat);
        this.recordForm.get('locationDetails.longitude')?.setValue(position.lng);

        this.center = { lat: position.lat, lng: position.lng };
    }



    performSearch($event: Event | null) {

        if($event){
            $event.preventDefault();
        }

        const addressSearcher = new google.maps.places.PlacesService(
            this.addresstext.nativeElement,
        );

        const searchRequest = {
            query: this.recordForm.get('locationDetails.location')?.value,
            fields: ['name', 'geometry', 'formatted_address'],
        };

        addressSearcher.findPlaceFromQuery(searchRequest, (results, status) => {

            if (status === google.maps.places.PlacesServiceStatus.OK && results) {

                for (const result of results) {

                    if(result.geometry?.location){

                        this.updateLocation(
                            result.geometry.location.lat(),
                            result.geometry.location.lng(),
                        );

                    }


                }
            }
        });
    }
}
