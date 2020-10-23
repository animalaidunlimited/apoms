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
  jobTypes$!: Observable<UserJobType[]>;
  team$!: Observable<Team[]>;

  constructor(public http: HttpClient) { 
    super(http);  
  }

  getAllTeams(): Observable<Team[]>{
    const request = '/GetAllTeams';

    if(!this.team$) {
      this.team$ = this.getObservable(request).pipe(
        map(response=>{
          return response.data;
        })
      );
    }
    return this.team$;
  }

  getUserJobType(): Observable<UserJobType[]> {
    const request = '/GetJobTypes';

    if(!this.jobTypes$) {
      this.jobTypes$ = this.getObservable(request).pipe(
        map(response=>{
          console.log((response[0])[0]);
          return (response[0])[0];
        })
      );
    }
    return this.jobTypes$;
  }

}
