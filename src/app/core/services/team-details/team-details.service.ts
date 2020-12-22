import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIService } from '../http/api.service';
import { TeamDetails } from 'src/app/core/models/team';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class TeamDetailsService extends APIService{
  endpoint = 'Teams';
  constructor(public http: HttpClient) {
    super(http);
  }

  public getAllTeams(): Observable<TeamDetails[]>{
    const request = '/GetAllTeams';
    return this.getObservable(request).pipe(
      map((response: any)  => {
        return response.data;
      }),
    );
  }

  public async saveTeam(teamDetails:TeamDetails): Promise<any>{
    if(teamDetails.TeamId){
      return await this.put(teamDetails);
    } else{
      return await this.post(teamDetails);
    }
  }
}

