import { TestBed } from '@angular/core/testing';

import { StreettreatTabBarService } from './streettreat-tab-bar.service';

describe('StreettreatTabBarService', () => {
  let service: StreettreatTabBarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StreettreatTabBarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
