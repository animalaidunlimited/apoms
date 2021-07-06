import { TestBed } from '@angular/core/testing';

import { DriverViewService } from './driver-view.service';

describe('DriverViewService', () => {
  let service: DriverViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DriverViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
