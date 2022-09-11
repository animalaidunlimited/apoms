import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { CurrentRota, Rota, RotaVersion } from 'src/app/core/models/rota';
import { APIService } from 'src/app/core/services/http/api.service';

interface UpsertRotaResponse{
  rotaId: number;
  rotaVersionId: number;
  success: number;
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

public async initialiseRotas() : Promise<CurrentRota> {

  let request = "/GetRotas";

  return await this.get(request).then((response:any) => {

    const rotaResponse: Rota[] = response;

    this.rotas.next(rotaResponse);

    const currentRota = rotaResponse.find(rota => rota.defaultRota);

    console.log(currentRota);

    const currentRotaVersion = currentRota?.rotaVersions.find(rotaVersion => rotaVersion.defaultRotaVersion);

    const currentRotaDetails : CurrentRota = {
      rotaId: currentRota?.rotaId,
      rotaName: currentRota?.rotaName,
      defaultRota: currentRota?.defaultRota,
      rotaVersionId: currentRotaVersion?.rotaVersionId,
      rotaVersionName: currentRotaVersion?.rotaVersionName,
      defaultRotaVersion: currentRotaVersion?.defaultRotaVersion,
      editing: !currentRota?.rotaId
    };

      return currentRotaDetails


      });
  
}

public getRotas() : BehaviorSubject<Rota[]> | undefined {

  return this.rotas;
  
}

public setRotaVersionRotaId(rotaId: number) : void {

  let currentRota = this.rotas?.value.find(rota => rota.rotaId === rotaId);

  this.rotaVersions?.next(currentRota?.rotaVersions || []);


}

public upsertRota(rota: Rota) : UpsertRotaResponse {
  
  if(this.rotas?.value.length){
    this.rotas.next([rota]);
  }
  else {
    let currentRotas = this.rotas.value;

    currentRotas.push(rota);

    this.rotas.next(currentRotas);
  }

  return {
    rotaId: 1,
    rotaVersionId: 1,
    success: 1}

}

// public upsertRotaVersion(rotaVersion: RotaVersion) : UpsertRotaResponse {

//   let currentRotaVersions = this.rotaVersions?.value || [];

//   currentRotaVersions.push(rotaVersion);

//   this.rotaVersions?.next(currentRotaVersions);

//   return {success: 1}

// }

}
