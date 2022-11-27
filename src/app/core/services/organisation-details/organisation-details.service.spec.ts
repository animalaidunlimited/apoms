import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { OrganisationDetailsService } from './organisation-details.service';


describe('OrganisationDetailsService', () => {
  let service: OrganisationDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [
        MatSnackBar, Overlay
      ]
    });
    service = TestBed.inject(OrganisationDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
