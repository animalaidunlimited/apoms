import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vehicle } from 'src/app/core/models/driver-view';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { VehicleShift } from 'src/app/core/models/vehicle';
import { APIService } from 'src/app/core/services/http/api.service';

@Injectable({
  providedIn: 'root'
})
export class VehicleService  extends APIService {
  endpoint = 'Vehicle';

  constructor(public http: HttpClient) {
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


  public getVehicleShifts() : Observable<VehicleShift[]>{

    return of(
      [
        {
          vehicleShiftId: 1,
          startTime: new Date("2021-11-07 06:00:00"),
          endTime: new Date("2021-11-07 08:00:00"),
          vehicleStaff: [
          {
            initials: "DP",
            firstName: "Dipesh",
            surname: "Thapa",
            colour: "green"
          },
          {
            initials: "KS",
            firstName: "Kamlesh",
            surname: "Sharma",
            colour: "lightgreen"
          }
          ]

        },
        {
          vehicleShiftId: 1,
          startTime: new Date("2021-11-07 08:00:01"),
          endTime: new Date("2021-11-07 10:30:00"),
          vehicleStaff: [
          {
            initials: "DD",
            firstName: "Deendeyal",
            surname: "Gora",
            colour: "purple"
          },
          {
            initials: "KSD",
            firstName: "KaluSingh",
            surname: "Deora",
            colour: "orange"
          }
          ]

        },
        {
          vehicleShiftId: 1,
          startTime: new Date("2021-11-07 10:30:00"),
          endTime: new Date("2021-11-07 17:15:0-1"),
          vehicleStaff: [
          {
            initials: "MD",
            firstName: "Manoj",
            surname: "Dangi",
            colour: "blue"
          },
          {
            initials: "GS",
            firstName: "Ganpat",
            surname: "Singh",
            colour: "magenta"
          }
          ]

        }
      ]
    )

  }
}
