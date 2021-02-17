import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from '../http/api.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { PatientCountInArea } from '../../models/census-details';


interface CensusTable {
    areaId: number;
    sortArea : number;
    actionId: number;
    sortAction : number;
    tagNumber: string;
    date: Date;
}

@Injectable({
    providedIn: 'root',
})
export class CensusService extends APIService {
    endpoint = 'CensusData';
    constructor(public http: HttpClient) {
        super(http);
    }

    public async insertCensusData(
        areaId:number, sortArea:number, actionId:number,
        sortAction:number, tagNumber:string, date: Date ): Promise<any> {

        const postData: CensusTable = {
            areaId,
            sortArea,
            actionId,
            sortAction,
            tagNumber,
            date,
        };
        return await this.post(postData)
            .then(data => {
                return data;
            })
            .catch(error => {
                console.log(error);
            });
    }

    public async getCensusData(dateObject: Date): Promise<any> {
        const request = '?CensusDate=' + dateObject;
        return this.get(request);
    }

    public async deleteCensusData(
        areaId:number, sortArea:number, actionId:number, sortAction:number, tagNumber:string, date: Date ): Promise<any> {

        const deleteData: CensusTable = {
            areaId,
            sortArea,
            actionId,
            sortAction,
            tagNumber,
            date
        };
        return await this.delete(deleteData).then(value=>
            {
                return value;
            })
            .catch(error => {
                console.log(error);
            });
    }

    public async getCensusByTag(tagNumber : string): Promise<any>{
        const request = '?TagNumber=' + tagNumber;
        return this.get(request);
    }

    public async getCensusPatientCount(): Promise<PatientCountInArea[] | null>{
        const request = '?CountPatient';
        return this.get(request);
    }

    public async getPatientDetailsByArea(area:any): Promise<any>{
        const request = '?Area=' + area;
        return this.get(request);
    }

    public async getCensusErrorRecords(): Promise<any>{
        const request = '?CensusErrors=true';

        return this.get(request);
    }


}
