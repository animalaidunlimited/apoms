import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from '../http/api.service';

interface CensusTable {
    areaId: number;
    sortArea : number;
    actionId: number;
    sortAction : number;
    tagNumber: number;
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
        areaId,
        sortArea,
        actionId,
        sortAction,
        tagNumber,
        date,
    ): Promise<any> {
        const request = 'censusData';

        const data: CensusTable = {
            areaId,
            sortArea,
            actionId,
            sortAction,
            tagNumber,
            date,
        };

        return await this.post(data)
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
        areaId,
        sortArea,
        actionId,
        sortAction,
        tagNumber,
        date,
        ): Promise<any> {
        const data: CensusTable = {
            areaId,
            sortArea,
            actionId,
            sortAction,
            tagNumber,
            date,
        };
        return await this.delete(data).then(data=>
            {
                return data;
            })
            .catch(error => {
                console.log(error);
            });
    }

    public async getCensusByTag(tagNumber : string): Promise<any>{
        const request = '?TagNumber=' + tagNumber;
        return this.get(request);
    }

}
