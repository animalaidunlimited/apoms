import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { APIService } from '../http/api.service';

@Injectable({
  providedIn: 'root'
})
export class LogsService extends APIService{
  endpoint = 'Logs';
  constructor(http: HttpClient) { 
    super(http);
  }

  public async getLogger(recordIds: any): Promise<any> {
    const request = '?recordIds=' + recordIds;
    return this.get(request);
  }
}
