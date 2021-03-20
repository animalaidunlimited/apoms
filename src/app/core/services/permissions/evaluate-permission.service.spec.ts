import { TestBed } from '@angular/core/testing';

import { EvaluatePermissionService } from './evaluate-permission.service';

describe('EvaluatePermissionService', () => {
  let service: EvaluatePermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EvaluatePermissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
