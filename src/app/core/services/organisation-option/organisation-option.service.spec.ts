import { TestBed } from '@angular/core/testing';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { OrganisationOptionsService } from './organisation-option.service';

describe('UserOptionsService', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [OrganisationOptionsService],
        }),
    );

    it('should be created', () => {
        const service: OrganisationOptionsService = TestBed.get(OrganisationOptionsService);
        expect(service).toBeTruthy();
    });
});