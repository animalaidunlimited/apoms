import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { VehicleService } from '../../services/vehicle.service';
import { AuthService } from 'src/app/auth/auth.service';
import { VehicleStatus, Vehicle, VehicleType, VehicleForm } from 'src/app/core/models/vehicle';
import { MediaService } from 'src/app/core/services/media/media.service';
import { ModelFormGroup } from 'src/app/core/helpers/form-model';


@Component({
  selector: 'app-vehicle-list-page',
  templateUrl: './vehicle-list-page.component.html',
  styleUrls: ['./vehicle-list-page.component.scss']
})
export class VehicleListPageComponent implements OnInit {

  displayedColumns: string[] = [
    'vehicleType',
    'registrationNumber',
    'vehicleNumber',
    'largeAnimalCapacity',
    'smallAnimalCapacity',
    'minRescuerCapacity',
    'maxRescuerCapacity',
    'vehicleStatus',
    'streetTreatVehicle',
    'streetTreatDefaultVehicle'
  ];

  dataSource!: MatTableDataSource<Vehicle> ;

  imgURL:string | ArrayBuffer | null = "assets/images/image_placeholder.png";

  uploading = false;

  vehicleStatus: VehicleStatus[] = [
    {VehicleStatusId: 1, VehicleStatus: 'Active'},
    {VehicleStatusId: 2, VehicleStatus: 'Inactive'},
    {VehicleStatusId: 3, VehicleStatus: 'Damaged'}
  ];

  vehicleType$!: Observable<VehicleType[]>;

  
  vehicleListForm: ModelFormGroup<Omit<VehicleForm, 'vehicleType' | 'vehicleStatus'| 'currentVehicleStaff'>> = this.fb.nonNullable.group({
    vehicleId: [0],
    vehicleNumber:[''],
    vehicleTypeId: [0],
    vehicleStatusId:[0],
    registrationNumber: [''],
    largeAnimalCapacity:[0],
    smallAnimalCapacity: [0],
    minRescuerCapacity:[0],
    maxRescuerCapacity:[0],
    imageURL:[''],
    vehicleColour: [''],
    streetTreatVehicle: [false],
    streetTreatDefaultVehicle: [false],
    organisationId: [this.authService.getOrganisationId()]
  });



  constructor(private dropdown: DropdownService,
              private fb: UntypedFormBuilder,
              private vehicleService: VehicleService,
              private snackBar: SnackbarService,
              private authService: AuthService,
              private mediaPaste: MediaService) { }

  ngOnInit() : void {
    this.vehicleType$ = this.dropdown.getVehicleType();
    this.refreshVehicleTable();

  }

  submit(vehicleForm: FormGroup) {

    this.vehicleService.upsertVehicleListItem(vehicleForm.value).then(response=> {
      if(response.success === -1) {
        this.snackBar.errorSnackBar('Communication error see admin', 'Ok');
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

  refreshVehicleTable() : void {
    this.vehicleService.getVehicleList().then((vehicleListTableData)=> {

      if(vehicleListTableData){
        this.dataSource = new MatTableDataSource(vehicleListTableData);
      }

    });
  }

  selectRow(selectedVehicle: Vehicle) : void {

    this.vehicleListForm.patchValue(selectedVehicle);
    this.imgURL = selectedVehicle.imageURL || "assets/images/image_placeholder.png";

  }

  deleteVehicle(vehicleId : number) : void {

    if(vehicleId) {
      this.vehicleService.deleteVehicleListItem(vehicleId).then(successResponse=> {

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

  uploadFile($event:any) : void {

    this.uploading = true;

    for(const file of $event.target.files)
    {

      let imgURL;

      var reader = new FileReader();

      reader.readAsDataURL(file);
      reader.onload = (_event) => {
        imgURL = reader.result;
      }

      const mediaItem = this.mediaPaste.handleImageUpload(file);

      mediaItem?.url.subscribe(url => {

        if(url) {
          this.uploading = false;
          this.vehicleListForm.get('imageURL')?.setValue(url);
        }
      })

    }

    if ($event.target.files.length === 0){
      return;
    }

    var mimeType = $event.target.files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    var reader = new FileReader();

    reader.readAsDataURL($event.target.files[0]);
    reader.onload = (_event) => {
      this.imgURL = reader.result;
    }



  }
}
