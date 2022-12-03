import { Overlay } from '@angular/cdk/overlay';
import { HttpClientModule } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { EditableDropdownService } from './editable-dropdown.service';

describe('EditableDropdownService', () => {
  let service: EditableDropdownService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        HttpClientTestingModule,
        ReactiveFormsModule
      ],
      providers: [ MatSnackBar, EditableDropdownService, Overlay ],

    });
  });

  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
    service = TestBed.inject(EditableDropdownService);
  }));

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
