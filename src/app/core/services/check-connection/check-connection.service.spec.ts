import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CheckConnectionService } from './check-connection.service';

describe('CheckConnectionService', () => {
  let service: CheckConnectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule
      ],
      providers: [CheckConnectionService]
    });
    service = TestBed.inject(CheckConnectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
