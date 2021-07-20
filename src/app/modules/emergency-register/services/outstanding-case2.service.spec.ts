import { TestBed } from '@angular/core/testing';

import { OutstandingCase2Service } from './outstanding-case2.service';

describe('OutstandingCase2Service', () => {
  let service: OutstandingCase2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OutstandingCase2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
