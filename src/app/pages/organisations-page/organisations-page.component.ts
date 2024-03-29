import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { LogoService } from 'src/app/core/services/logo/logo.service';
import { FormArray, UntypedFormBuilder, FormGroup } from '@angular/forms';
import { GoogleMap } from '@angular/google-maps';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { OrganisationMarker, OrganisationDetail, OrganisationAddress } from 'src/app/core/models/organisation';
import { OrganisationDetailsService } from 'src/app/core/services/organisation-details/organisation-details.service';
import { LatLngLiteral } from 'src/app/core/models/driver-view';


@Component({
    selector: 'app-organisations-page',
    templateUrl: './organisations-page.component.html',
    styleUrls: ['./organisations-page.component.scss'],
})
export class OrganisationsPageComponent implements OnInit {

    center!: google.maps.LatLngLiteral;
    imageSrc!: string | ArrayBuffer;
    latlngbounds = new google.maps.LatLngBounds(undefined);
    markers: OrganisationMarker[] = [];
    options = {maxZoom: 13};
    organisationId!:number;
    organisationForm!:FormGroup ;
    updateDropDown:number[] = [];
    zoom = 10;
    uploadingImage = false;

    @ViewChildren('addressSearch') addresstext!: QueryList<ElementRef>;
    @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;

    constructor(
        private logoService:LogoService,
        private organisationDetails: OrganisationDetailsService,
        private fb: UntypedFormBuilder,
        private changeDetector: ChangeDetectorRef,
        private snackbar: SnackbarService
    ) {

        // this.organisationForm = this.fb.group({
        //     address: [],
        //     name: '',
        //     driverViewDeskNumber:  ''
        // });

    }


    get addressArray() { return this.organisationForm?.get('address') as FormArray; }


    ngOnInit() {

        this.center = this.organisationDetails.getDefaultCoordinates();

        // tslint:disable-next-line: no-non-null-assertion
        this.organisationId = parseInt(this.organisationDetails.getOrganisationId()!,10);


        this.organisationDetails.organisationDetail.subscribe((orgDetail:OrganisationDetail) => {

            this.organisationForm = this.fb.group({
                organisationId : this.organisationId,
                logoUrl: orgDetail.logoUrl,
                address: [],
                name: orgDetail.name,
                driverViewDeskNumber: orgDetail.driverViewDeskNumber
            });

            const addressVal = (orgDetail.address ? this.createAddressArray(orgDetail.address) : this.fb.array([this.createEmptyItem()]));

            this.organisationForm.setControl("address", addressVal);

        });


    }

    uploadLogo($event:Event){
        
        if((($event.target as HTMLInputElement).files as FileList).length){


            this.uploadingImage = true;
            const file = (($event.target as HTMLInputElement).files as FileList)[0];

            const reader = new FileReader();
            // tslint:disable-next-line: no-non-null-assertion
            reader.onload = e => this.imageSrc = reader.result!;
            reader.readAsDataURL(file);

            const result = this.logoService.uploadLogo(file, this.organisationId);

            result.mediaItemId.subscribe(success => {

                if(success === 0){
                    this.uploadingImage = false;

                    this.organisationDetails.updateOrganisationLogo(result.mediaItem?.localURL);
                }
            });
            


        }else{
            this.uploadingImage = false;
            return;
        }
        

    }

    addMarker(latLng: google.maps.LatLngLiteral, index:number) {

        const marker: OrganisationMarker = {
            index,
            position: latLng,
            label: '',
            options: { draggable: true },
        };

        if(!latLng.lat && !latLng.lng){
            marker.position = this.center;
        }

        // this.updateAddressLocation(latLng, index)

        this.markers.push(marker);

        this.changeDetector.detectChanges();
    }

    updateAddressLocation(latLng: google.maps.LatLngLiteral, index: number) : void {

        this.addressArray?.at(index)?.get('latLng')?.setValue(latLng);

        this.latlngbounds.extend(new google.maps.LatLng(latLng.lat, latLng.lng));

        this.map?.fitBounds(this.latlngbounds);

        if(this.map?.getZoom() || 20 >= 15 ){
            this.map.zoom = 15;
        }

        this.organisationForm.markAsDirty();

    }

    markerDragEnd(event: google.maps.MapMouseEvent, marker: OrganisationMarker) {

        if(!event.latLng){
            return;
        }

        const currentLocation = event.latLng.toJSON();

        this.center = currentLocation;

        this.updateAddressLocation(currentLocation, marker.index );

    }



    performSearch(index:number, $event:Event) {

        $event.preventDefault();

        const addressSearcher = new google.maps.places.PlacesService(
            this.addresstext.get(index)?.nativeElement,
        );


        const searchRequest = {
            query: this.addresstext.get(index)?.nativeElement.value,
            fields: ['name', 'geometry', 'formatted_address'],
        };

        addressSearcher.findPlaceFromQuery(searchRequest, (results, status) => {

            if(!results){
                return;
            }

            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (const result of results) {

                    if(result.geometry?.location){

                        this.addMarker(
                            this.getLatLngLiteral(result.geometry?.location),
                            index
                        );

                    }


                }
            }

        });
    }

    addItem($event:Event): void {
        $event.preventDefault();

        this.addressArray.push(this.createEmptyItem());

    }

    deleteItem($event:Event, index:number){
        $event.preventDefault();
        this.addressArray.removeAt(index);
    }

    createEmptyItem() : FormGroup {

        return this.fb.group({
            name:'',
            latLng: '',
            address:'',
            number: ''
        })

    }

    createAddressArray(address:any) : FormArray{

        const emptyLatLngLiteral: LatLngLiteral = {lat : 0, lng: 0}
        
        const emptyValue = this.fb.nonNullable.group({
            name: '',
            latLng: [emptyLatLngLiteral],
            address: '',
            number: ''
        })

        const addressGroup = this.fb.array([emptyValue]);

        // tslint:disable-next-line: no-shadowed-variable
        address.forEach((address:OrganisationAddress, index:number) => {

            this.addMarker(address.latLng, index);

            addressGroup.push(this.fb.nonNullable.group({
                name: [address.name],
                latLng: [address.latLng],
                address: [address.address],
                number: [address.number]
            }));
        });

        return addressGroup;

    }


    getPlaceAutocomplete(index:number) : void {
        if(this.addresstext.get(index)?.nativeElement.value.length < 2)
        {
            return;
        }

        const autocomplete = new google.maps.places.Autocomplete(
            this.addresstext.get(index)?.nativeElement,
            {
                // TODO update this based on the settings of the user
                componentRestrictions: { country: 'IN' },
                types: ['geocode'],
            },
        );

        google.maps.event.addListener(autocomplete, 'place_changed', () => {
            const place = autocomplete.getPlace();

            if(place?.formatted_address){
                this.invokeEvent(place, index );
            }
        });
    }

    invokeEvent(place: any, index:number) : void {

        const result = place as google.maps.places.PlaceResult;

        this.addressArray.at(index).get('address')?.setValue(result.formatted_address);

        const address = this.addresstext.get(index)?.nativeElement;

        address.value =  result.formatted_address;

        if(result.geometry?.location){

            this.addMarker(this.getLatLngLiteral(result.geometry?.location), index );
        }

    }

    getLatLngLiteral(latLng: google.maps.LatLng) : google.maps.LatLngLiteral {

        return {lat : latLng.lat(), lng: latLng.lng()}

    }

    onSubmit(organisationDetails:FormGroup) : void {

        if(organisationDetails.dirty){

            this.organisationDetails.updateOrganisationDetail(organisationDetails?.value).then(response => {

                response.success === 1 ?
                    this.snackbar.successSnackBar('Organisation details saved successfully', 'OK')
                :
                    this.snackbar.errorSnackBar('An error has occurred: Error number: OPC: 283','OK');

            });

        }

    }


}
