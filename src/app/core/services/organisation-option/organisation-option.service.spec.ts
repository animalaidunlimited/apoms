import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';

import { OrganisationOptionsService } from './organisation-option.service';

describe('OrganisationOptionsService', () => {
  let service: OrganisationOptionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        MatSnackBar, Overlay
      ]
    });
    service = TestBed.inject(OrganisationOptionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
