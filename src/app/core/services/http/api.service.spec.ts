import { TestBed } from '@angular/core/testing';

import { APIService } from '../../services/http/api.service'
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
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
        }),
    );

    it('should be created', () => {
        const service: APIService = TestBed.get(TestAPI);
        expect(service).toBeTruthy();
    });
});
