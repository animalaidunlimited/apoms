import { TestBed } from '@angular/core/testing';

import { EmergencyRegisterTabBarService } from './emergency-register-tab-bar.service';

describe('EmergencyRegisterTabBarService', () => {
  let service: EmergencyRegisterTabBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmergencyRegisterTabBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
