import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { APIService } from '../http/api.service';

interface CensusTable {
    areaId: number;
    actionId: number;
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
        actionId,
        tagNumber,
        date,
    ): Promise<any> {
        const request = 'censusData';

        const data: CensusTable = {
            areaId,
            actionId,
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
        actionId,
        tagNumber,
        date,
    ): Promise<any> {
        const data: CensusTable = {
            areaId,
            actionId,
            tagNumber,
            date,
        };
        return this.delete(data);
    }
}
