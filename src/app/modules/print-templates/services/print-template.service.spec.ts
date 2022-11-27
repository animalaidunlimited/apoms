import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { sideNavPath } from 'src/app/nav-routing';

import { PrintTemplateService } from './print-template.service';

describe('PrintTemplatesService', () => {
  let service: PrintTemplateService;

  const formBuilder: UntypedFormBuilder = new UntypedFormBuilder();

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
        { provide: UntypedFormBuilder, useValue: formBuilder }
      ]

    });

  });

  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
    service = TestBed.inject(PrintTemplateService);

  }));


  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
