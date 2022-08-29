import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LogSearchObject } from '../../models/logs-data';
import { APIService } from '../http/api.service';



@Injectable({
  providedIn: 'root'
})
export class LogsService extends APIService{
  endpoint = 'Logs';
  constructor(http: HttpClient) { 
    super(http);
  }

  public async getLogger(searchValues: LogSearchObject): Promise<any> {

    const request = `?emergencyCaseId=${searchValues.emergencyCaseId}&patientIds=${searchValues.patientIds}`;

    return this.get(request);
  }
}
