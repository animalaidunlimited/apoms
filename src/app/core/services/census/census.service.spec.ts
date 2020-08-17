import { TestBed } from '@angular/core/testing';

import { CensusService } from './census.service';
import {
    HttpTestingController,
    HttpClientTestingModule,
} from '@angular/common/http/testing';

describe('CensusService', () => {
    let injector: TestBed;
    let service: CensusService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CensusService],
        });
        service = TestBed.inject(CensusService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
