import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { sideNavPath } from 'src/app/nav-routing';

import { PrintTemplateService } from './print-template.service';

describe('PrintTemplatesService', () => {
  let service: PrintTemplateService;

  const formBuilder: FormBuilder = new FormBuilder();

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule.withRoutes([
          {
              path: sideNavPath,
              children: [],
          },
      ])
      ],
      providers: [
        MatSnackBar,
        Overlay,
        { provide: FormBuilder, useValue: formBuilder }
      ]

    });

  });

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    service = TestBed.inject(PrintTemplateService);

  }));


  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
