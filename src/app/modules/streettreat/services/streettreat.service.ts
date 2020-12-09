import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SearchStreetTreatResponse } from 'src/app/core/models/responses';
import { APIService } from 'src/app/core/services/http/api.service';

@Injectable({
  providedIn: 'root'
})
export class StreetTreatService extends APIService {

  constructor(
    http: HttpClient,) { 
    super(http);
  }
  endpoint = 'StreetTreat';
  response:SearchStreetTreatResponse  = {} as SearchStreetTreatResponse;
  redirectUrl = '';
}
