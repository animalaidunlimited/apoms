import { TestBed } from '@angular/core/testing';

import { Case1ServiceService } from './case1-service.service';

describe('Case1ServiceService', () => {
  let service: Case1ServiceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Case1ServiceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
