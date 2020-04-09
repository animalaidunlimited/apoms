import { TestBed } from '@angular/core/testing';

import { PatientService } from './patient.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';


describe('PatientService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [PatientService]
  }));

  it('should be created', () => {
    const service: PatientService = TestBed.get(PatientService);
    expect(service).toBeTruthy();
  });
});
