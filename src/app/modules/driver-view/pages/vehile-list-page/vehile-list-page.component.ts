import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { Vehicle, VehicleStatus, VehicleType } from 'src/app/core/models/driver-view';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { DriverViewService } from '../../services/driver-view.service';



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
    'minRescuerCapacity',
    'maxRescuerCapacity',
    'vehicleStatus'
  ];

  dataSource!: MatTableDataSource<Vehicle[]> ;

  vehicleType$!: Observable<VehicleType[]>;

  vehicleListForm = this.fb.group({
    vehicleId: [],
    registrationNumber: [''],
    vehicleNumber:[''],
    vehicleTypeId: [],
    largeAnimalCapacity:[],
    smallAnimalCapacity: [],
    vehicleStatusId:[],
    minRescuerCapacity:[],
    maxRescuerCapacity:[]
  });


  constructor(private dropdown: DropdownService,
              private fb: FormBuilder,
              private driverViewService: DriverViewService,
              private snackBar: SnackbarService) { }

  ngOnInit(): void {
    this.vehicleType$ = this.dropdown.getVehicleType();
    this.refreshVehicleTable();
  }

  Submit(vehicleForm: FormGroup) {

    this.driverViewService.upsertVehicleListItem(vehicleForm.value).then(response=> {
      if(response.success === -1) {
        this.snackBar.errorSnackBar('Communication error see adim', 'Ok');
      }
      else {
        if(response.success === 1) {
          this.snackBar.successSnackBar('Saved Successfully', 'Ok');
          this.refreshVehicleTable();
        }
        else {
          this.snackBar.errorSnackBar('Duplicate entry', 'Ok');
        }

      }
    });

  }

  refreshVehicleTable() {
    this.driverViewService.getVehicleListTableData().then((vehicleListTabledata)=> {
      this.dataSource = vehicleListTabledata;
    })
  }

  selectRow(selectedVehicle: any) {

    console.log(selectedVehicle);

    this.vehicleListForm.patchValue(selectedVehicle);
  }

  deleteVehicle(vehicleId : number) {

    console.log(vehicleId);
    if(vehicleId) {
      this.driverViewService.deleteVehicleListItem(vehicleId).then(successResponse=> {

        if(successResponse.success === -1) {
          this.snackBar.errorSnackBar('Communication error see adim', 'Ok');
        }
        else {
          if(successResponse.success === 1) {
            this.snackBar.successSnackBar('Deleted Successfully', 'Ok');
            this.refreshVehicleTable();
          }
          else {
            this.snackBar.errorSnackBar('Unable to delete', 'Ok');
          }
        }

      });
    }

  }

}
