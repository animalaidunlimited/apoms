import { DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vehicle } from 'src/app/core/models/driver-view';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { VehicleShift } from 'src/app/core/models/vehicle';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { APIService } from 'src/app/core/services/http/api.service';

@Injectable({
  providedIn: 'root'
})
export class VehicleService  extends APIService {
  endpoint = 'Vehicle';

  currentVehicleShifts: VehicleShift[] = [];
  vehicleShifts:BehaviorSubject<VehicleShift[]> = new BehaviorSubject<VehicleShift[]>([]);

  constructor(
    public http: HttpClient,
    private dropdowns: DropdownService
    ) {
    super(http);
  }

  public async upsertVehicleListItem(vehicleDetail: any) : Promise<SuccessOnlyResponse> {
    if (vehicleDetail.vehicleId) {
      return await this.put(vehicleDetail);
    } else {
      return await this.post(vehicleDetail);
    }
  }

  public getVehicleList(): Promise<any> {
    const request = '?GetVehicleList';
    return this.get(request);
  }

  public getVehicleListObservable() : Observable<Vehicle[]> {

    const request = '?GetVehicleList';

        return this.getObservable(request).pipe(
            map((response: Vehicle[]) => {
                return response;
            }),
        );

  }



  public async deleteVehicleListItem(vehicleId : number) : Promise<SuccessOnlyResponse> {
    let deleteobject = {
      vehicleId:vehicleId,
      isDeleted: true
    }
    return await this.put(deleteobject).then((output)=>{
      return output;
    }).catch((error:any)=>{
        console.log(error);
    });

  }

  addVehicleShift(vehicleId: Number, iShiftDetails:FormGroup){

    const exists = this.currentVehicleShifts.findIndex(shift => shift.vehicleId === vehicleId);

    let shiftDetails = iShiftDetails.value as VehicleShift;

    shiftDetails.shiftStartTime = new Date(shiftDetails.shiftStartTime);
    shiftDetails.shiftEndTime = new Date(shiftDetails.shiftEndTime);

    console.log(iShiftDetails)

    shiftDetails.vehicleStaff = shiftDetails.vehicleStaff.filter(staff => staff.userId);

    // We need to populate the list
    this.dropdowns.getRescuers().subscribe(staff => {

      shiftDetails.vehicleStaff.forEach(vehicleStaff => {

        let currentStaffDetails = staff.find(currentStaff => currentStaff.userId === vehicleStaff.userId);

        vehicleStaff.firstName = '' + currentStaffDetails?.firstName;
        vehicleStaff.surname = '' + currentStaffDetails?.surname;
        vehicleStaff.initials = '' + currentStaffDetails?.initials;

      });

      this.currentVehicleShifts.splice(exists, exists > 0 ? 1 : 0, shiftDetails);

      this.currentVehicleShifts.sort((a,b) => a.shiftStartTime.getTime() - b.shiftStartTime.getTime());

      this.vehicleShifts.next(this.currentVehicleShifts);

    });



  }

  public removeShift(shift: VehicleShift){

    const currentShifts = this.currentVehicleShifts.filter(current => current.shiftUUID !== shift.shiftUUID);

    this.vehicleShifts.next(currentShifts);

  }

  public editShift(shift: VehicleShift){

  }

}
