import { TestBed } from '@angular/core/testing';

import { PromptUpdateService } from './update-service.service';

describe('UpdateServiceService', () => {
  let service: PromptUpdateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PromptUpdateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
