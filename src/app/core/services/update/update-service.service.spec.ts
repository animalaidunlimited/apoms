import { TestBed } from '@angular/core/testing';
import { SwUpdate } from '@angular/service-worker';
import { MaterialModule } from 'src/app/material-module';

import { PromptUpdateService } from './update-service.service';

describe('UpdateServiceService', () => {
  let service: PromptUpdateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ MaterialModule, SwUpdate ]
    });
    service = TestBed.inject(PromptUpdateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
