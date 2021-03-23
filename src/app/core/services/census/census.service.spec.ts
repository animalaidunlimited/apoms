import { TestBed } from '@angular/core/testing';

import { CensusService } from './census.service';
import {
    HttpClientTestingModule,
} from '@angular/common/http/testing';

describe('CensusService', () => {
    let service: CensusService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CensusService]
        });
        service = TestBed.inject(CensusService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
