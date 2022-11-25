import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { RotaDayAssignment } from 'src/app/core/models/rota';
import { UserDetails } from 'src/app/core/models/user';
import { UserDetailsService } from 'src/app/core/services/user-details/user-details.service';
import { UserOptionsService } from 'src/app/core/services/user-option/user-options.service';
import { APIService } from 'src/app/core/services/http/api.service';

@Injectable({
  providedIn: 'root'
})
export class DailyRotaService extends APIService{

  endpoint = 'Rota';

constructor(
  http: HttpClient  
) {
  super(http);
 }

saveAssignment(assignment: RotaDayAssignment) : Promise<SuccessOnlyResponse> {

  return this.putSubEndpoint(`RotaDayAssignment`, assignment);

}

getRotationPeriodForRotaVersion(rotaVersionId: number, limit?: number, offset?: number) : Promise<number | null> {

  limit = limit || 1;
  offset = offset || 0;

  return this.get(`GetRotationPeriods?rotaVersionId=${rotaVersionId}&limit=${limit}&offset=${offset}`)

}

}
