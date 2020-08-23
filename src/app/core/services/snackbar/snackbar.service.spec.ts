import { TestBed, getTestBed } from '@angular/core/testing';

import { SnackbarService } from './snackbar.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';


import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import {
    HttpTestingController,
    HttpClientTestingModule,
} from '@angular/common/http/testing';

describe('SnackbarService', () => {
    let injector: TestBed;
    let service: SnackbarService;
    let httpMock: HttpTestingController;


    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [MatSnackBarModule, HttpClientTestingModule],
            providers: [MatSnackBar, SnackbarService],
        });
        injector = getTestBed();
        service = injector.get(SnackbarService);
        httpMock = injector.get(HttpTestingController);
    });


    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
