import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { DriverViewService } from '../../services/driver-view.service';

export interface VehicleType {
  VehicleTypeId : number;
  VehicleType: string;
}

interface VehicleStatus {
  VehicleStatusId: number;
  VehicleStatus: string;
}

@Component({
  selector: 'app-vehile-list-page',
  templateUrl: './vehile-list-page.component.html',
  styleUrls: ['./vehile-list-page.component.scss']
})
export class VehileListPageComponent implements OnInit {

  vehicleStatus: VehicleStatus[] = [
    {VehicleStatusId: 1, VehicleStatus: 'Active'},
    {VehicleStatusId: 2, VehicleStatus: 'Inactive'},
    {VehicleStatusId: 3, VehicleStatus: 'Damaged'}
  ];

  displayedColumns: string[] = [
    'vehicleType',
    'registrationNumber',
    'vehicleNumber',
    'largeAnimalCapacity',
    'smallAnimalCapacity',
    'vehicleStatus'
  ];

  dataSource!: MatTableDataSource<any> ;

  vehicleType$!: Observable<VehicleType[]>;

  vehicleListForm = this.fb.group({
    vehicleId: [],
    registrationNumber: [''],
    vehicleNumber:[''],
    vehicleTypeId: [],
    largeAnimalCapacity:[],
    smallAnimalCapacity: [],
    vehicleStatusId:[]
  });


  constructor(private dropdown: DropdownService,
              private fb: FormBuilder,
              private driverViewService: DriverViewService,
              private snackBar: SnackbarService) { }

  ngOnInit(): void {
    this.vehicleType$ = this.dropdown.getVehicleType();
    this.refreshVehicleTable();
    this.deleteVehicle(1);
  }

  Submit(vehicleForm: FormGroup) {

    this.driverViewService.upsertVehicleListItem(vehicleForm.value).then(response=> {
      if(response.success === -1) {
        this.snackBar.errorSnackBar('Communication error see adim', 'Ok');
      }
      else {
        response.success === 1 ?  this.snackBar.successSnackBar('Saved Successfully', 'Ok') :  this.snackBar.errorSnackBar('Duplicate entry', 'Ok');
      }
    });
    
  }

  refreshVehicleTable() {
    this.driverViewService.getVehicleListTableData().then((vehicleListTabledata:any)=> {
      this.dataSource = vehicleListTabledata;
    })
  }

  selectRow(selectedVehicle: any) {

    console.log(selectedVehicle);

    this.vehicleListForm.patchValue(selectedVehicle);
  }

  deleteVehicle(vehicleId : number) {

    if(vehicleId) {
      this.driverViewService.deleteVehicleListItem(vehicleId).then(val=> {
        console.log(val);
      });
    }

  }

}
