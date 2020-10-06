import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { PrintTemplateService } from './print-template.service';

describe('PrintTemplatesService', () => {
  let service: PrintTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule
      ],

    });
    service = TestBed.inject(PrintTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
