/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { PatientVisitDetailsService } from './patient-visit-details.service';

describe('Service: PatientVisitDetails', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PatientVisitDetailsService]
    });
  });

  it('should ...', inject([PatientVisitDetailsService], (service: PatientVisitDetailsService) => {
    expect(service).toBeTruthy();
  }));
});
