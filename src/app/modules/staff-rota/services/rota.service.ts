import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { APIService } from 'src/app/core/services/http/api.service';

@Injectable({
  providedIn: 'root'
})
export class RotaService extends APIService {

  endpoint = 'rota';

constructor(http: HttpClient) {
  super(http);
 }

public checkDateNotInRange(date: Date | string) : Observable<{success: number}> { 

  console.log('here');

  return of({success: 0})}

}
