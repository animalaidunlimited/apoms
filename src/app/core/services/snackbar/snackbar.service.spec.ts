import { TestBed, getTestBed } from '@angular/core/testing';

import { SnackbarService } from './snackbar.service';

import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
    HttpTestingController,
    HttpClientTestingModule,
} from '@angular/common/http/testing';
import { Overlay } from '@angular/cdk/overlay';

describe('SnackbarService', () => {
    let injector: TestBed;
    let service: SnackbarService;
    let httpMock: HttpTestingController;


    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSnackBarModule, HttpClientTestingModule],
            providers: [MatSnackBar, SnackbarService, Overlay],
        });
        injector = getTestBed();
        service = injector.inject(SnackbarService);
        httpMock = injector.inject(HttpTestingController);
    });


    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
