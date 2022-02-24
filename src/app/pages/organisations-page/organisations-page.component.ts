import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { LogoService } from 'src/app/core/services/logo/logo.service';
import { OrganisationOptionsService } from 'src/app/core/services/organisation-option/organisation-option.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { GoogleMap } from '@angular/google-maps';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { OrganisationMarker, OrganisationDetail, OrganisationAddress } from 'src/app/core/models/organisation';


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

    @ViewChildren('addressSearch') addresstext!: QueryList<ElementRef>;
    @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;

    constructor(
        private logoService:LogoService,
        private organisationOptions: OrganisationOptionsService,
        private fb: FormBuilder,
        private changeDetector: ChangeDetectorRef,
        private snackbar: SnackbarService
    ) {

        this.organisationForm = this.fb.group({
            address: '',
            name: ''
        });

    }


    get address() { return this.organisationForm?.get('address') as FormArray; }

    ngOnInit() {

        this.center = this.organisationOptions.getDefaultCoordinates();

        // tslint:disable-next-line: no-non-null-assertion
        this.organisationId = parseInt(this.organisationOptions.getOrganisationId()!,10);


        this.organisationOptions.organisationDetail.subscribe((orgDetail:OrganisationDetail) => {

            this.organisationForm = this.fb.group({
                organisationId : this.organisationId,
                logoUrl: orgDetail.logoUrl,
                address: orgDetail.address ? this.createItem(orgDetail.address) : this.fb.array([this.createItem()]),
                name: orgDetail.name
            });

        });


    }

    uploadLogo($event:Event){

        if((($event.target as HTMLInputElement).files as FileList).length){

            const file = (($event.target as HTMLInputElement).files as FileList)[0];

            const reader = new FileReader();
            // tslint:disable-next-line: no-non-null-assertion
            reader.onload = e => this.imageSrc = reader.result!;
            reader.readAsDataURL(file);

            const result = this.logoService.uploadLogo(file, this.organisationId);


        }else{
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

        this.updateAddressLocation(latLng, index)

        this.markers.push(marker);

        this.changeDetector.detectChanges();
    }

    updateAddressLocation(latLng: google.maps.LatLngLiteral, index: number) : void {

        this.address?.at(index)?.get('latLng')?.setValue(latLng);

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

        this.address.push(this.createItem());

    }

    deleteItem($event:Event, index:number){
        $event.preventDefault();
        this.address.removeAt(index);
    }

    createItem(address?:any) : FormGroup | FormArray{
        if(address){

            const addressGroup = this.fb.array([]);

            // tslint:disable-next-line: no-shadowed-variable
            address.forEach((address:OrganisationAddress, index:number) => {

                this.addMarker(address.latLng, index);

                addressGroup.push(this.fb.group({
                    name: address.name,
                    latLng: address.latLng,
                    address: address.address,
                    number: address.number
                }));
            });

            return addressGroup;

        }
        else{
            return this.fb.group({
                name:'',
                latLng: '',
                address:'',
                number: ''
            });
        }
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

        this.address.at(index).get('address')?.setValue(result.formatted_address);

        const address = this.addresstext.get(index)?.nativeElement;

        address.value =  result.formatted_address;

        if(result.geometry?.location){

            this.addMarker(this.getLatLngLiteral(result.geometry?.location), index );
        }

    }

    getLatLngLiteral(latLng: google.maps.LatLng) : google.maps.LatLngLiteral {

        return {lat : latLng.lat(), lng: latLng.lng()}

    }

    onSubmit(organisationOptions:FormGroup) : void {

        if(organisationOptions.dirty){

            this.organisationOptions.updateOrganisationDetail(organisationOptions?.value).then(response => {

                response.success === 1 ?
                    this.snackbar.successSnackBar('Organisation details saved successfully', 'OK')
                :
                    this.snackbar.errorSnackBar('An error has occured: Error number: OPC: 289','OK');

            });

        }


    }


}
