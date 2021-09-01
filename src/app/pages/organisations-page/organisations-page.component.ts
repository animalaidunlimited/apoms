import { ChangeDetectorRef, Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { LogoService } from 'src/app/core/services/logo/logo.service';
import { OrganisationOptionsService } from 'src/app/core/services/organisation-option/organisation-option.service';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { GoogleMap } from '@angular/google-maps';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { map } from 'rxjs/internal/operators/map';
import { UniqueValidators } from 'src/app/core/components/patient-visit-details/unique-validators';
import { Observable } from 'rxjs';

export interface Position {
    lat: number;
    lng: number;
}
export interface Marker {
    position: Position;
    label: string;
    options: any;
}
@Component({
    selector: 'app-organisations-page',
    templateUrl: './organisations-page.component.html',
    styleUrls: ['./organisations-page.component.scss'],
})
export class OrganisationsPageComponent implements OnInit {
    organisationId!:number;
    organisationForm:FormGroup = new FormGroup({});
    imageSrc!: string | ArrayBuffer;
    markers: Marker[] = [];
    center!: google.maps.LatLngLiteral;
    latlngbounds = new google.maps.LatLngBounds(undefined);
    problemRows!:Observable<FormArray>;

    zoom = 13;
    @ViewChildren('addressSearch') addresstext!: QueryList<ElementRef>;
    @ViewChild(GoogleMap, { static: false }) map!: GoogleMap;

    constructor(
        private logoService:LogoService, 
        private organisationOptions: OrganisationOptionsService,
        private fb: FormBuilder,
        private changeDetector: ChangeDetectorRef,
        private snackbar: SnackbarService,
        private dropDown: DropdownService) {}
    

    get address() { return this.organisationForm.get('address') as FormArray; }

    ngOnInit() {
        // tslint:disable-next-line: no-non-null-assertion
        this.organisationId = parseInt(this.organisationOptions.getOrganisationId()!,10);

        this.organisationOptions.organisationDetail.subscribe(orgDetail => {
            
                this.organisationForm = this.fb.group({
                    organisationId : this.organisationId,
                    logoUrl: orgDetail.logoUrl,
                    address: orgDetail.address ? this.createItem(orgDetail.address) : this.fb.array([this.createItem()]),
                    name: orgDetail.name,
                    problems : this.fb.array([])
                });

            }
        );

        this.problemRows = this.dropDown.getAllProblems().pipe(
            map(problems => problems.map(problem => ({...problem, Editable: false}))),
            map(problems => {

                const problemsGroup: FormGroup[] = problems.map(problem =>  this.fb.group({
                    problemId: problem.ProblemId,
                    problem: problem.Problem,
                    isDeleted: problem.IsDeleted,
                    sortOrder: problem.SortOrder
                }));
            
                const problemFA =  new FormArray(problemsGroup);
                problemFA.setValidators([UniqueValidators.uniqueBy('sortOrder')]);
                problemFA.disable();
                return problemFA;

            })
        );

    }

    addItem($event:Event): void {
        $event.preventDefault();


        this.address.push(this.createItem());

    }

    deleteItem($event:Event, index:number){
        $event.preventDefault();
        this.address.removeAt(index);
    }

    createItem(address?:any):any {
        if(address){

            const addressGroup = this.fb.array([]);

            // tslint:disable-next-line: no-shadowed-variable
            address.forEach((address:any, index:number) => {

                this.updateLocation(address.latLng?.lat, address.latLng?.lng, index);
                
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

    updateLocation(latitude: number, longitude: number, index:number) {

        
        const marker: Marker = {
            position: { lat: latitude, lng: longitude },
            label: '',
            options: { draggable: true },
        };

        this.address.at(index)?.get('latLng')?.setValue({ lat: latitude, lng: longitude });

        this.latlngbounds.extend(new google.maps.LatLng(latitude, longitude));

        this.map.fitBounds(this.latlngbounds);
        

        this.markers.push(marker);

        this.changeDetector.detectChanges();
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

            if (status === google.maps.places.PlacesServiceStatus.OK) {
                for (const result of results) {

                    if(result.geometry){          

                        this.updateLocation(
                            result.geometry.location.lat(),
                            result.geometry.location.lng(),
                            index
                        );
                        
                    }


                }
            }

        });
    }

    markerDragEnd(event: google.maps.MouseEvent) {
        const position = event.latLng.toJSON();
        this.center = { lat: position.lat, lng: position.lng };
    }

    

    

    getPlaceAutocomplete(index:number) {
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
    
    invokeEvent(place: any, index:number) {
        

        const result = place as google.maps.places.PlaceResult;
        


        this.address.at(index).get('address')?.setValue(result.formatted_address);
        
        const address = this.addresstext.get(index)?.nativeElement;

        address.value =  result.formatted_address;

        if(result.geometry){

            this.updateLocation(
                result.geometry.location.lat(),
                result.geometry.location.lng(),
                index
            );
        }


    }

    
    onSubmit(organisationOptions:FormGroup){
        const problems = organisationOptions.get('problems')?.value;
        

       
        if(organisationOptions.dirty || problems.length){
 
            this.organisationOptions.updateOrganisationDetail({ ...organisationOptions?.value,  problems}).then(res => {
                console.log(res);
                if(res){
                    this.snackbar.successSnackBar('Organisation details saved successfully', 'OK');
                } else {
                    this.snackbar.errorSnackBar('Invalid action','OK');
                }
            });

        }
        
    }

}
