import { TestBed } from '@angular/core/testing';

import { CaseService } from './case.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Overlay } from '@angular/cdk/overlay';
import { SnackbarService } from 'src/app/core/services/snackbar/snackbar.service';

describe('CaseService', () => {

    let snackbarService: SnackbarService;

    beforeEach(() =>
        TestBed.configureTestingModule({
            imports: [
                HttpClientTestingModule
            ],
            providers: [
                CaseService,
                MatSnackBar,
                Overlay
            ],
        }),
    );

    it('should be created', () => {
        const service: CaseService = TestBed.inject(CaseService);
        snackbarService = TestBed.inject(SnackbarService);




        expect(service).toBeTruthy();
    });
});
