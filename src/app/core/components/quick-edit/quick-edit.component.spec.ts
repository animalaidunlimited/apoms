import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { QuickEditDialog } from './quick-edit.component';

import { MatDialogRef, MatDialog, MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PatientStatusModule } from '../patient-status/patient-status.module';

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('QuickEditDialog', () => {
  let component: QuickEditDialog;
  let fixture: ComponentFixture<QuickEditDialog>;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close')
  };

  const dialogData = {};

  let dialog: MatDialogRef<QuickEditDialog>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [MatDialogModule, PatientStatusModule, HttpClientTestingModule, BrowserAnimationsModule],
      providers: [DropdownService,
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData },
        {
        provide: MatDialogRef,
        useValue: mockDialogRef
      }],
      declarations: [ QuickEditDialog ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuickEditDialog);
    component = fixture.componentInstance;
    dialog = TestBed.get(MatDialog);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
