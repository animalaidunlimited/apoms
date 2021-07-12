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

    this.vehicleShifts.subscribe(val => console.log(val));
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

  addVehicleShift(shiftDate: Date, vehicleId: Number, iShiftDetails:FormGroup){

    const exists = this.currentVehicleShifts.findIndex(shift => shift.vehicleId === vehicleId);

    let shiftDetails = iShiftDetails.value as VehicleShift;


    const datePipe = new DatePipe('en-GB');
    const dateString = datePipe.transform(shiftDate, 'yyyy-MM-dd');

    shiftDetails.startTime = new Date(dateString + 'T' + shiftDetails.shiftStartTimeString + ':00');
    shiftDetails.endTime = new Date(dateString + 'T' + shiftDetails.shiftEndTimeString + ':00');

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

      this.currentVehicleShifts.sort((a,b) => a.startTime.getTime() - b.startTime.getTime());

      this.vehicleShifts.next(this.currentVehicleShifts);

    });



  }


  //public getVehicleShifts() : Observable<VehicleShift[]>{

  //  return of(
  //    [
  //      {
  //        vehicleShiftId: 1,
  //        vehicleId: 1,
  //        startTime: new Date("2021-11-07 06:00:00"),
  //        endTime: new Date("2021-11-07 08:00:00"),
  //        vehicleStaff: [
  //        {
  //          staffId: 1,
  //          initials: "DP",
  //          firstName: "Dipesh",
  //          surname: "Thapa",
  //          colour: "green"
  //        },
  //        {
  //          staffId: 2,
  //          initials: "KS",
  //          firstName: "Kamlesh",
  //          surname: "Sharma",
  //          colour: "lightgreen"
  //        }
  //        ]

  //      },
  //      {
  //        vehicleShiftId: 1,
  //        vehicleId: 2,
  //        startTime: new Date("2021-11-07 08:00:01"),
  //        endTime: new Date("2021-11-07 10:30:00"),
  //        vehicleStaff: [
  //        {
  //          staffId: 3,
  //          initials: "DD",
  //          firstName: "Deendeyal",
  //          surname: "Gora",
  //          colour: "purple"
  //        },
  //        {
  //          staffId: 4,
  //          initials: "KSD",
  //          firstName: "KaluSingh",
  //          surname: "Deora",
  //          colour: "orange"
  //        }
  //        ]

  //      },
  //      {
  //        vehicleShiftId: 1,
  //        vehicleId: 3,
  //        startTime: new Date("2021-11-07 10:30:00"),
  //        endTime: new Date("2021-11-07 17:15:01"),
  //        vehicleStaff: [
  //        {
  //          staffId: 5,
  //          initials: "MD",
  //          firstName: "Manoj",
  //          surname: "Dangi",
  //          colour: "blue"
  //        },
  //        {
  //          staffId: 6,
  //          initials: "GS",
  //          firstName: "Ganpat",
  //          surname: "Singh",
  //          colour: "magenta"
  //        }
  //        ]

  //      }
  //    ]
  //  )

  //}
}
