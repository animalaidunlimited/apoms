import { TestBed } from '@angular/core/testing';

import { CaseService } from './case.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Overlay } from '@angular/cdk/overlay';

describe('CaseService', () => {
    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                CaseService,
                MatSnackBar,
                Overlay
            ],
        }),
    );

    it('should be created', () => {
        const service: CaseService = TestBed.get(CaseService);
        expect(service).toBeTruthy();
    });
});
