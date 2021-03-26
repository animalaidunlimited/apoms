import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { LogsService } from './logger.service';

describe('LoggerService', () => {
  let service: LogsService;

  beforeEach(() => {
    
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ]
    });
    service = TestBed.inject(LogsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
