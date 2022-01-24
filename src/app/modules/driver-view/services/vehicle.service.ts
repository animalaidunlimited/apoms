
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { generateUUID } from 'src/app/core/helpers/utils';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { HourRange, Vehicle, VehicleShift } from 'src/app/core/models/vehicle';
import { DropdownService } from 'src/app/core/services/dropdown/dropdown.service';
import { APIService } from 'src/app/core/services/http/api.service';
import { OrganisationOptionsService } from 'src/app/core/services/organisation-option/organisation-option.service';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';

interface UpsertShiftResult{
  success: number
  vehicleShiftId: number
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService  extends APIService {

  endpoint = 'Vehicle';

  currentVehicleShifts: VehicleShift[] = [];
  vehicleShifts:BehaviorSubject<VehicleShift[]> = new BehaviorSubject<VehicleShift[]>([]);
  private ngUnsubscribe = new Subject();

  constructor(
    public http: HttpClient,
    private dropdowns: DropdownService,
    private snackbar: SnackbarService,
    private orgOptions: OrganisationOptionsService
    ) {
    super(http);
  }


  public populateVehicleShiftDetails (date: string) {

    if(date){

      let request = "/GetVehicleShiftDetails?" + "shiftDate=" + date;

      this.get(request).then((response:any) => {

        if(!response){
          this.currentVehicleShifts = [];
          this.vehicleShifts.next(this.currentVehicleShifts);
          return;
        }

        this.currentVehicleShifts = response?.map((shift:VehicleShift) => {

          shift.shiftUUID = generateUUID();

          shift.shiftStartTimeDate = new Date(shift.shiftStartTime);
          shift.shiftEndTimeDate = new Date(shift.shiftEndTime);

          return shift;

      });

        this.vehicleShifts.next(this.currentVehicleShifts);

      })

    }

  }

  public async upsertVehicleListItem(vehicleDetail: any) : Promise<SuccessOnlyResponse> {
    if (vehicleDetail.vehicleId) {
      return await this.put(vehicleDetail);
    } else {
      return await this.post(vehicleDetail);
    }
  }

  public getVehicleList(): Promise<any> {
    const request = '/GetVehicleList';
    return this.get(request);
  }

  public getVehicleListObservable() : Observable<Vehicle[]> {

    const request = '/GetVehicleList';

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

  upsertVehicleShift(vehicleId: Number, iShiftDetails:FormGroup) : void {

    const exists = this.currentVehicleShifts.findIndex(shift => shift.vehicleId === vehicleId && shift.shiftUUID === iShiftDetails.get('shiftUUID')?.value);

    let shiftDetails = iShiftDetails.value as VehicleShift;

    shiftDetails.shiftStartTimeDate = new Date(shiftDetails.shiftStartTime);
    shiftDetails.shiftEndTimeDate = new Date(shiftDetails.shiftEndTime);

    // Remove any empty users
    shiftDetails.vehicleStaff = shiftDetails.vehicleStaff.filter(staff => staff.userId);

    // We need to populate the user details for use in the shift bars
    this.dropdowns.getRescuers().pipe(takeUntil(this.ngUnsubscribe)).subscribe(staff => {

      shiftDetails.vehicleStaff.forEach(vehicleStaff => {

        let currentStaffDetails = staff.find(currentStaff => currentStaff.userId === vehicleStaff.userId);

        vehicleStaff.firstName = '' + currentStaffDetails?.firstName;
        vehicleStaff.surname = '' + currentStaffDetails?.surname;
        vehicleStaff.initials = '' + currentStaffDetails?.initials;

      });



      const upsert = shiftDetails.vehicleShiftId ?
                                  this.putSubEndpoint("/VehicleShiftDetails",shiftDetails) :
                                  this.postSubEndpoint("/VehicleShiftDetails",shiftDetails);

      upsert.then((result:UpsertShiftResult) => {

        shiftDetails.vehicleShiftId = result.vehicleShiftId;

        // If the shift already exists, then replace it with the updated one, otherwise add it into the array.
        this.currentVehicleShifts.splice(exists, exists > -1 ? 1 : 0, shiftDetails);

        this.currentVehicleShifts.sort((a,b) => a.shiftStartTimeDate.getTime() - b.shiftStartTimeDate.getTime());

        this.processUpsertShiftResult(result)

      });

    });

  }

  private processUpsertShiftResult(result: UpsertShiftResult) {


    if (result.success === 1) {

      this.vehicleShifts.next(this.currentVehicleShifts);
      this.snackbar.successSnackBar('Shift updated successfully', 'OK');

    }
    else {
      this.snackbar.errorSnackBar('Error updating shift: please see admin', 'OK');
    }

  }

  public removeShift(shift: VehicleShift){

    shift.isDeleted = true;

    this.putSubEndpoint("/VehicleShiftDetails",shift).then(result => {

      if (result.success === 1) {
        this.currentVehicleShifts = this.currentVehicleShifts.filter(current => current.shiftUUID !== shift.shiftUUID);
        this.vehicleShifts.next(this.currentVehicleShifts);
        this.snackbar.successSnackBar('Shift removed successfully', 'OK');
      }
      else {
        this.snackbar.errorSnackBar('Error updating shift: please see admin', 'OK');
      }

    });

  }

  public getHourRange() : HourRange {

    let start = this.orgOptions.getVehicleAssignerStartHour();
    let end = this.orgOptions.getVehicleAssignerEndHour();

    var range = [];

    for (let i = start; i <= end; i++) {
      range.push(i);
    }

    range.sort((a,b) => a-b);

    return { start, end, range } as HourRange;


  }

}
