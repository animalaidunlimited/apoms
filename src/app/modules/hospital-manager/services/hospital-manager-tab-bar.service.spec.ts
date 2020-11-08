import { TestBed } from '@angular/core/testing';

import { HospitalManagerTabBarService } from './hospital-manager-tab-bar.service';

describe('HospitalManagerTabBarService', () => {
  let service: HospitalManagerTabBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HospitalManagerTabBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
