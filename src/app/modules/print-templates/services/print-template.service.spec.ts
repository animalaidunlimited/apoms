import { TestBed } from '@angular/core/testing';

import { PrintTemplateService } from './print-template.service';

describe('PrintTemplatesService', () => {
  let service: PrintTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PrintTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
