import { TestBed } from '@angular/core/testing';

import { StreetTreatTabBarService } from './streettreat-tab-bar.service';

describe('StreettreatTabBarService', () => {
  let service: StreetTreatTabBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StreetTreatTabBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
