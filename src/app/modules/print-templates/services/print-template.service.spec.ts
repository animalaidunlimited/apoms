import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { sideNavPath } from 'src/app/nav-routing';

import { PrintTemplateService } from './print-template.service';

describe('PrintTemplatesService', () => {
  let service: PrintTemplateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule.withRoutes([
          {
              path: sideNavPath,
              children: [],
          },
      ])
      ],

    });
    service = TestBed.inject(PrintTemplateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
