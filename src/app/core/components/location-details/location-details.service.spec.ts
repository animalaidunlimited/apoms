import { TestBed } from '@angular/core/testing';

import { LocationDetailsService } from './location-details.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('LocationDetailsService', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [LocationDetailsService],
            schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
        }),
    );

    it('should be created', () => {
        const service: LocationDetailsService = TestBed.get(
            LocationDetailsService,
        );
        expect(service).toBeTruthy();
    });
});
