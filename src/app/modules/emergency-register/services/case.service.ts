import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CrudService } from 'src/app/core/services/http/crud.service';
import { EmergencyCase } from 'src/app/core/models/emergency-record';
import { EmergencyResponse } from 'src/app/core/models/responses';

@Injectable({
  providedIn: 'root'
})
export class CaseService extends CrudService {

  constructor(
    http: HttpClient  ) {
      super(http);
    }

    endpoint = 'EmergencyRegister';
    response: EmergencyResponse;
    redirectUrl: string;


  public async postCase(emergencyCase:EmergencyCase)
  {
      try {
          this.response = await this.post({ emergencyCase }) as EmergencyResponse;

          if(!this.response){
              throw new Error(
                "Unable to insert Emergency Case",
              );
          }
          return this.response;
      } catch (error) {
          //console.error('Error during login request', error);
          return Promise.reject(error);
      }
  }

  public async putCase(emergencyCase:EmergencyCase)
  {
      try {
          this.response = await this.put({ emergencyCase }) as EmergencyResponse;
          if(!this.response){
              throw new Error(
                "Unable to update Emergency Case",
              );
          }
          return this.response;
      } catch (error) {
          //console.error('Error during login request', error);
          return Promise.reject(error);
      }
  }

  public async getCaseById(emergencyNumber:number)
  {
      try {

          this.response = await this.getById(emergencyNumber) as EmergencyResponse;
          if(!this.response){
              throw new Error(
                  "Unable to get Case with ID: emergencyNumber: " + emergencyNumber,
              );
          }
          return this.response;
      } catch (error) {
          //console.error('Error during login request', error);
          return Promise.reject(error);
      }
  }

  public async deleteById(emergencyNumber:number)
  {
      try {
          this.response = await this.deleteById(emergencyNumber) as EmergencyResponse;
          if(!this.response){
              throw new Error(
                "Unable to delete Case with ID: emergencyNumber: " + emergencyNumber,
              );
          }
          return this.response;
      } catch (error) {
          //console.error('Error during login request', error);
          return Promise.reject(error);
      }
  }
}


