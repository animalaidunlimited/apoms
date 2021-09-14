import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { Vehicle, VehicleStatus, VehicleType } from 'src/app/core/models/driver-view';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';
import { VehicleService } from '../../services/vehicle.service';
import { AuthService } from 'src/app/auth/auth.service';
import { MediaPasteService } from './../../../../core/services/navigation/media-paste/media-paste.service';
import { skip } from 'rxjs/operators';



@Component({
  selector: 'app-vehicle-list-page',
  templateUrl: './vehicle-list-page.component.html',
  styleUrls: ['./vehicle-list-page.component.scss']
})
export class VehicleListPageComponent implements OnInit {

  @ViewChild('uploader') uploader!: ElementRef;
  imgURL!:string | ArrayBuffer | null;

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
    maxRescuerCapacity:[],
    organisationId: this.authService.getOrganisationId(),
    vehicleImage:''
  });


  constructor(private dropdown: DropdownService,
              private fb: FormBuilder,
              private vehicleService: VehicleService,
              private snackBar: SnackbarService,
              private authService:AuthService,
              private mediaPaste:MediaPasteService) { }

  ngOnInit(): void {
    this.vehicleType$ = this.dropdown.getVehicleType();
    this.refreshVehicleTable();

  }

  Submit(vehicleForm: FormGroup) {

    const file = this.uploader.nativeElement.files[0];

    if(file){
      const mediaItem = this.mediaPaste.handleImageUpload(file);
      
      mediaItem?.url.pipe(skip(1)).subscribe(url => {

        if(url){
          
          this.vehicleListForm.get('vehicleImage')?.setValue(url);

          console.log(this.vehicleListForm.value);
          this.saveVehicleForm(this.vehicleListForm.value);

        }

      });

    }else {
      console.log(vehicleForm.value);
      this.saveVehicleForm(vehicleForm.value);
    }
    
  }

  saveVehicleForm(vehicleForm:any){
    this.vehicleService.upsertVehicleListItem(vehicleForm).then(response=> {
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

  refreshVehicleTable() {
    this.vehicleService.getVehicleList().then((vehicleListTabledata)=> {
      this.dataSource = vehicleListTabledata;
    });
  }

  selectRow(selectedVehicle: any) {
    this.vehicleListForm.patchValue(selectedVehicle);

  }

  deleteVehicle(vehicleId : number) {
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
  
    if ($event.target.files.length === 0)
      return;

    const mimeType = $event.target.files[0].type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    const reader = new FileReader();
 
    reader.readAsDataURL($event.target.files[0]); 
    reader.onload = (_event) => { 
      this.imgURL = reader.result; 
    };

    
  
  }
}
