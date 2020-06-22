import { TestBed } from '@angular/core/testing';

import { LocationDetailsService } from './location-details.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('LocationDetailsService', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [LocationDetailsService],
        }),
    );

    it('should be created', () => {
        const service: LocationDetailsService = TestBed.get(
            LocationDetailsService,
        );
        expect(service).toBeTruthy();
    });
});
