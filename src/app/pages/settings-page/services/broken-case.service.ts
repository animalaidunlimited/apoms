import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SuccessOnlyResponse } from 'src/app/core/models/responses';
import { APIService } from 'src/app/core/services/http/api.service';
import { BrokenCase } from '../broken-cases/broken-cases.component';

@Injectable({
  providedIn: 'root'
})
export class BrokenCaseService extends APIService {

  endpoint = 'EmergencyRegister';

constructor(
  http: HttpClient,
) {
  super(http);
 }

 async deleteBrokenCase(brokenCaseDetailsId: number) : Promise<SuccessOnlyResponse> {

  const body = {
    brokenCaseDetailsId: brokenCaseDetailsId
  }

  return this.putSubEndpoint("DeleteBrokenCase", body);  

}

async resolveBrokenCases() : Promise<SuccessOnlyResponse> {

  return this.postSubEndpoint("ResolveBrokenCases",undefined);

}

async getBrokenCases() : Promise<BrokenCase[]> {

  return this.get("/BrokenCases").then(result => result as BrokenCase[]);
}

}
