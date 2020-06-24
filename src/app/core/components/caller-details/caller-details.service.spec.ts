import { TestBed } from '@angular/core/testing';

import { CallerDetailsService } from './caller-details.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('CallerDetailsService', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        }),
    );

    it('should be created', () => {
        const service: CallerDetailsService = TestBed.get(CallerDetailsService);
        expect(service).toBeTruthy();
    });
});
