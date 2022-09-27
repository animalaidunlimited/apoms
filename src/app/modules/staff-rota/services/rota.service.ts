import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { CurrentRota, Rota, RotaVersion } from 'src/app/core/models/rota';
import { APIService } from 'src/app/core/services/http/api.service';

interface UpsertRotaResponse{
  rotaId: number;
  rotaVersionId: number;
  rotaSuccess: number;
  rotaVersionSuccess: number;
}
@Injectable({
  providedIn: 'root'
})
export class RotaService extends APIService {

  endpoint = 'Rota';

  rotas:BehaviorSubject<Rota[]> = new BehaviorSubject<Rota[]>([]);
  rotaVersions:BehaviorSubject<RotaVersion[]> = new BehaviorSubject<RotaVersion[]>([]);

  constructor(http: HttpClient) {
    super(http);
  }

public checkDateNotInRange(date: Date | string) : Observable<{success: number}> { 

  console.log('here');

  return of({success: 0});

}

public async initialiseRotas() : Promise<CurrentRota | undefined> {

  let request = "/GetRotas";

  return await this.get(request).then((response:any) => {

    if(!response){
      return undefined;
    }

    const rotaResponse: Rota[] = response;

    this.rotas.next(rotaResponse);

    const currentRota = rotaResponse?.find(rota => rota.defaultRota); 

    const currentRotaVersion = currentRota?.rotaVersions.find(rotaVersion => rotaVersion.defaultRotaVersion);

    //Combine the default rota and default version within that rota to produce the current rota.
    const currentRotaDetails : CurrentRota = {
      rotaId: currentRota?.rotaId,
      rotaName: currentRota?.rotaName,
      defaultRota: currentRota?.defaultRota,
      rotaVersionId: currentRotaVersion?.rotaVersionId,
      rotaVersionName: currentRotaVersion?.rotaVersionName,
      defaultRotaVersion: currentRotaVersion?.defaultRotaVersion,
      editing: !currentRota?.rotaId
    };

    return currentRotaDetails;


  });
  
}

public getRotas() : BehaviorSubject<Rota[]> | undefined {

  return this.rotas;

}



public setRotaVersionRotaId(rotaId: number) : void {

  let currentRota = this.rotas?.value.find(rota => rota.rotaId === rotaId);

  this.rotaVersions?.next(currentRota?.rotaVersions || []);

}

public upsertRota(rota: CurrentRota) : Promise<UpsertRotaResponse> {

  if(!rota.rotaId){
    rota.defaultRotaVersion = true;
  }
  
  return rota.rotaId ? this.put(rota) : this.post(rota).then((result: UpsertRotaResponse) => {

    if(result.rotaSuccess === 1){

      let currentRotas = this.rotas.value;

      let foundIndex = currentRotas.findIndex(element => element.rotaId === rota.rotaId);

      rota.rotaId = result.rotaId;
      rota.rotaVersionId = result.rotaVersionId;

      if(foundIndex === -1){
        let currentRota = this.rotas.value;
        currentRota.push(this.getRotaFromCurrentRota(rota));
      }
      else {
        currentRotas.splice(foundIndex, 1, this.getRotaFromCurrentRota(rota));
      }

      this.rotas.next(currentRotas);
    }

    return result;
  });

}

getRotaFromCurrentRota(rota: CurrentRota) : Rota {

  const newRota:Rota  = {
    rotaId: rota.rotaId || -1,
    rotaName: rota.rotaName || "",
    defaultRota: true,
    rotaVersions: [{
        rotaId: rota.rotaId || -1,
        rotaVersionId: rota.rotaVersionId || -1,
        rotaVersionName: rota.rotaVersionName || "",
        defaultRotaVersion: true,
        rotaVersionDeleted: false
      }]
  };
  
  return newRota;

}

public saveRotaVersion(rotaVersion: RotaVersion) : UpsertRotaResponse {

  let currentRotaVersions = this.rotaVersions?.value || [];

  let returnRotaVersion = {} as UpsertRotaResponse;

  if(rotaVersion.rotaVersionId){

      //TODO - Call the API and add a new rota version

      if(rotaVersion.rotaVersionDeleted){

        const removeIndex = currentRotaVersions.findIndex(element => element.rotaVersionId === rotaVersion.rotaVersionId)
        currentRotaVersions.splice(removeIndex, 1);

      }


  console.log(currentRotaVersions);

  returnRotaVersion = {
    rotaId: rotaVersion.rotaId,
    rotaVersionId: rotaVersion.rotaVersionId,
    rotaSuccess: 1,
    rotaVersionSuccess: 1
  };

  }
  else {

    rotaVersion.rotaVersionId = 3;
  
    currentRotaVersions.push(rotaVersion);
  
    this.rotaVersions?.next(currentRotaVersions);

    returnRotaVersion = {
      rotaId: rotaVersion.rotaId,
      rotaVersionId: 3,
      rotaSuccess: 1,
      rotaVersionSuccess: 1
      
    };

  }


  return returnRotaVersion;



  }





}
