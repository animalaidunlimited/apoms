/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Overlay } from '@angular/cdk/overlay';
import { RotaService } from './rota.service';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SnackbarService } from './../../../core/services/snackbar/snackbar.service';

describe('Service: Rota', () => {

  let service: RotaService;
  let snackbar: SnackbarService

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ 
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule
      ],
      providers: [
        RotaService,
        MatSnackBar,
        Overlay
      ]
    });
  });
        
        
  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
    service = TestBed.inject(RotaService);    
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
