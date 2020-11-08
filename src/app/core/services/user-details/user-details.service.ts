import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from '../http/api.service';
import { Team, UserJobType } from '../../models/userDetails';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserDetailsService extends APIService {
  endpoint= 'Team';


  constructor(public http: HttpClient) { 
    super(http);  
  }




}
