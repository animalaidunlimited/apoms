import { TestBed } from '@angular/core/testing';

import { EditableDropdownService } from './editable-dropdown.service';

describe('EditableDropdownService', () => {
  let service: EditableDropdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EditableDropdownService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
