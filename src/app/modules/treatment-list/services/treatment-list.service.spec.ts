import { TestBed } from '@angular/core/testing';

import { TreatmentListService } from './treatment-list.service';

describe('TreatmentListService', () => {
  let service: TreatmentListService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TreatmentListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
