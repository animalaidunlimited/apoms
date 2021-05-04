import { TestBed } from '@angular/core/testing';

import { APIService } from '../../services/http/api.service';
import { HttpClient } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, Injectable } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';

@Injectable({
    providedIn: 'root',
})
class TestAPI extends APIService {
    endpoint = '';
    constructor(http: HttpClient) {
        super(http);
    }
}

describe('APIService', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }),
    );

    it('should be created', () => {
        const service: APIService = TestBed.get(TestAPI);
        expect(service).toBeTruthy();
    });
});
