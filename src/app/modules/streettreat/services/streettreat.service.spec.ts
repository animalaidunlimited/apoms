import { TestBed } from '@angular/core/testing';

import { StreetreatService } from './streetreat.service';

describe('StreetreatService', () => {
  let service: StreetreatService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StreetreatService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
