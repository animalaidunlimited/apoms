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
      rotaDeleted: currentRota?.rotaDeleted,
      rotaVersionId: currentRotaVersion?.rotaVersionId,
      rotaVersionName: currentRotaVersion?.rotaVersionName,
      defaultRotaVersion: currentRotaVersion?.defaultRotaVersion,
      rotaVersionDeleted: currentRotaVersion?.rotaVersionDeleted,
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

public setRotaAsDefault(defaultRotaId: number) : void {

  let currentRotas = this.rotas.value;

  currentRotas.forEach(rota => rota.defaultRota = rota.rotaId === defaultRotaId);

  this.rotas.next(currentRotas);

}

public setRotaVersionAsDefault(defaultRotaVersionId: number) : void {

  let currentRotaVersions = this.rotaVersions.value;

  currentRotaVersions.forEach(rotaVersion => rotaVersion.defaultRotaVersion = rotaVersion.rotaVersionId === defaultRotaVersionId);

  this.rotaVersions.next(currentRotaVersions);

}

public async upsertRota(rota: CurrentRota) : Promise<UpsertRotaResponse> {

  if(!rota.rotaId){
    rota.defaultRotaVersion = true;
  }
  
  let upsertResponse = rota.rotaId ? this.put(rota) : this.post(rota);
  
  return upsertResponse.then((result: UpsertRotaResponse) => {

    let currentRotas = this.rotas.value;

    let foundIndex = currentRotas.findIndex(element => element.rotaId === rota.rotaId);

    if(result.rotaSuccess === 1){

      rota.rotaId = result.rotaId;
      rota.rotaVersionId = result.rotaVersionId;

      if(foundIndex === -1){
        let currentRota = this.rotas.value;
        currentRota.push(this.getRotaFromCurrentRota(rota));
      }
      else {

        let updateRota = currentRotas[foundIndex];
        
        updateRota.rotaName = rota.rotaName || "";
        updateRota.defaultRota = rota.defaultRota || false;

        if(rota.rotaDeleted){
          currentRotas.splice(foundIndex, 1);
        }
        else
        {
          currentRotas.splice(foundIndex, 1, updateRota);
        }
        
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
    rotaDeleted: false,
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

public async saveRotaVersion(rotaVersion: RotaVersion) : Promise<UpsertRotaResponse> {


  let returnRotaVersion = {} as UpsertRotaResponse;

  returnRotaVersion.rotaVersionSuccess = -1;

  return this.putSubEndpoint("RotaVersion",rotaVersion).then(response => {

      if(response.success === 1){

        const versions = this.rotaVersions.value;

        const currentVersion = versions.find(element => element.rotaVersionId === rotaVersion.rotaVersionId);

        if(currentVersion){
          currentVersion.rotaVersionName = rotaVersion.rotaVersionName;
        }
        else {
          const newRota = {
            rotaId: rotaVersion.rotaId,   
            rotaVersionId: response.rotaVersionId,
            rotaVersionName: rotaVersion.rotaVersionName,
            defaultRotaVersion: rotaVersion.defaultRotaVersion,
            rotaVersionDeleted: false
          }

          versions.push(newRota);

        }

        if(rotaVersion.defaultRotaVersion){
          this.setRotaVersionAsDefault(response.rotaVersionId);
        }

        this.rotaVersions.next(versions);

        if(rotaVersion.rotaVersionDeleted){

          const removeIndex = versions.findIndex(element => element.rotaVersionId === rotaVersion.rotaVersionId);
          versions.splice(removeIndex, 1);
    
        }

        returnRotaVersion = {
          rotaId: rotaVersion.rotaId,
          rotaVersionId: response.rotaVersionId,
          rotaSuccess: 1,
          rotaVersionSuccess: 1
        };
        
        return returnRotaVersion;

      }
      
      return returnRotaVersion;

    });







  }





}
