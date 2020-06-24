import { TestBed, getTestBed } from '@angular/core/testing';

import { SurgeryService } from './surgery.service';
import {
    HttpTestingController,
    HttpClientTestingModule,
} from '@angular/common/http/testing';

describe('SurgeryService', () => {
    let injector: TestBed;
    let service: SurgeryService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [SurgeryService],
        });

        injector = getTestBed();
        service = injector.get(SurgeryService);
        httpMock = injector.get(HttpTestingController);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
