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

    it('Home should be Udaipur when blank', () => {
        const service: UserOptionsService = TestBed.get(UserOptionsService);

        const coords = service.getCoordinates();
        const coordObject = {
            lat: 24.57127,
            lng: 73.691544,
        };

        expect(coords).toEqual(coordObject);

    });

    it('Default duration should be 5 seconds', () => {
        const service: UserOptionsService = TestBed.get(UserOptionsService);

        const notificationSeconds = service.getNotifactionDuration();

        expect(notificationSeconds).toEqual(3);

    });
});
