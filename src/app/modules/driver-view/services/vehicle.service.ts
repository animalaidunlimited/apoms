import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Vehicle } from 'src/app/core/models/driver-view';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
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
}
