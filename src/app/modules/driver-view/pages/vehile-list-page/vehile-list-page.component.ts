import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';

export interface VehicleType {
  VehicleTypeId : number;
  VehicleType: string;
}

@Component({
  selector: 'app-vehile-list-page',
  templateUrl: './vehile-list-page.component.html',
  styleUrls: ['./vehile-list-page.component.scss']
})
export class VehileListPageComponent implements OnInit {

  vehicleType$!: Observable<VehicleType[]>;

  vehicleListForm = this.fb.group({
    vehicleId: [],
    registrationNumber: [],
    vehicleNumber:[],
    vehicleTypeId: [],
    largeAnimalCapacity:[],
    smallAnimalCapacity: []
  });


  constructor(private dropdown: DropdownService,
              private fb: FormBuilder) { }

  ngOnInit(): void {
    this.vehicleType$ = this.dropdown.getVehicleType();

    this.vehicleType$.subscribe(val=>{
      console.log(val)
    })
  }

  Submit(vehicleForm: FormGroup) {
    console.log(vehicleForm.value);
  }

}
