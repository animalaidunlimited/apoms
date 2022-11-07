/* tslint:disable:no-unused-variable */

import { TestBed, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Overlay } from '@angular/cdk/overlay';
import { RotaService } from './rota.service';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
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
        
        
  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    service = TestBed.inject(RotaService);    
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
