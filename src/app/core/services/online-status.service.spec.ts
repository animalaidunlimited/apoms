import { TestBed } from '@angular/core/testing';

import { OnlineStatusService } from './online-status.service';

describe('OnlineStatusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OnlineStatusService = TestBed.get(OnlineStatusService);
    expect(service).toBeTruthy();
  });
});
