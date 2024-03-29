import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Marker } from 'src/app/core/components/location-details/location-details.component';
import { DriverAssignment } from 'src/app/core/models/driver-view';


interface DialogData {
  assignmentDetails: DriverAssignment;
}


@Component({
  selector: 'app-location-dialog',
  templateUrl: './location-dialog.component.html',
  styleUrls: ['./location-dialog.component.scss']
})
export class LocationDialogComponent implements OnInit {

  mapOptions : google.maps.MapOptions = {};

  options : any = {};

  markers: Marker[] = [];

  center!: google.maps.LatLngLiteral;

  zoom!: number;

  constructor(public MatDialogRef: MatDialogRef<LocationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) { }

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



    this.initialiseLocation(this.data.assignmentDetails?.latLngLiteral);
  }


  initialiseLocation(coordinates: any) {
    this.zoom = 13;

    this.markers = [];

    this.center = { lat: this.data.assignmentDetails?.latLngLiteral.lat , lng: this.data.assignmentDetails?.latLngLiteral.lng };

    const marker: Marker = {
        position: { lat: coordinates?.lat, lng: coordinates?.lng },
        label: '',
        options: { draggable: true },
    };

    this.markers.push(marker);
}

closeLocationDialog() {
  this.MatDialogRef.close();
}

}
