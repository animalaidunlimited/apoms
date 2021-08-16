import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { GoogleMap } from '@angular/google-maps';
import { Router } from '@angular/router';
import { Marker } from 'src/app/core/components/location-details/location-details.component';
import { DriverAssignment } from 'src/app/core/models/driver-view';
import { DriverViewService } from '../../services/driver-view.service';

@Component({
  selector: 'app-case-location',
  templateUrl: './case-location.component.html',
  styleUrls: ['./case-location.component.scss']
})
export class CaseLocationComponent implements OnInit, AfterViewInit{

  casesList!: DriverAssignment[];

  isNavigated = 'true';
  
  @ViewChild(GoogleMap) map!: GoogleMap;

  mapOptions : google.maps.MapOptions = {};

  markers: Marker[] = [];

  center!: google.maps.LatLngLiteral;

  zoom = 14;

  bounds = new google.maps.LatLngBounds(undefined);

  constructor(private driverView: DriverViewService,
    private router: Router,
    private cdRef:ChangeDetectorRef) { 
    }

  ngOnInit(): void {
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
      ]
    } as google.maps.MapOptions;

  }

  hasLargeAninmal(patients:any) : boolean{
    
    return patients.some((patient: any) => patient.largeAnimal);

  }

  findCenter(caseListVal: DriverAssignment[]) {

    caseListVal?.forEach(val=> {
      if(val.latLngLiteral){
        this.bounds.extend(new google.maps.LatLng(val.latLngLiteral.lat, val.latLngLiteral.lng));
      }
    });

    this.fitMaps(this.bounds);
  }

  ngAfterViewInit() {

    
    
    this.driverView.driverViewDetails.subscribe(caseList=> {
      this.casesList = caseList;
      this.findCenter(caseList);
    });
    this.cdRef.detectChanges();
  }

  changeRoute() {

    this.router.navigate(['/nav/driver-view'], { replaceUrl: true });

  }

  fitMaps(latlngbounds: google.maps.LatLngBounds){
    if(this.map){
      this.map.fitBounds(latlngbounds);

      this.map.panToBounds(latlngbounds);

      this.map.zoomChanged.subscribe(() => {

        if(this.map.getZoom() > 12) {
          this.zoom = 13;
          this.cdRef.detectChanges();
        }

      });
    }
  }
  

}
