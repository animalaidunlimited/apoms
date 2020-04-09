import { TestBed } from '@angular/core/testing';

import { DropdownService } from './dropdown.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DropdownService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientTestingModule],
    providers: [DropdownService]
  }));

  it('should be created', () => {
    const service: DropdownService = TestBed.get(DropdownService);
    expect(service).toBeTruthy();
  });
});
