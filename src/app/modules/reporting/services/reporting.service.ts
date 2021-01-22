import { Injectable } from '@angular/core';
import { APIService } from 'src/app/core/services/http/api.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { EmergencyRecordTable } from 'src/app/core/models/emergency-record';

@Injectable({
  providedIn: 'root'
})
export class ReportingService extends APIService{
  
  endpoint = 'Reporting';

  constructor(public http: HttpClient) {
    super(http);
  }

  public async getEmergencyCaseByDate(dateValue: Date | string) : Promise<EmergencyRecordTable[] | null> {
    const request = '?CaseDate=' + dateValue;
    return await this.get(request);
  }
}
