import { TestBed } from '@angular/core/testing';

import { UserOptionsService } from './user-options.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('UserOptionsService', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [UserOptionsService],
        }),
    );

    it('should be created', () => {
        const service: UserOptionsService = TestBed.get(UserOptionsService);
        expect(service).toBeTruthy();
    });
});
