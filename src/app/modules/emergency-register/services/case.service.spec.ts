import { TestBed } from '@angular/core/testing';

import { CaseService } from './case.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';


describe('CaseService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [CaseService]
  }));

  it('should be created', () => {
    const service: CaseService = TestBed.get(CaseService);
    expect(service).toBeTruthy();
  });
});
