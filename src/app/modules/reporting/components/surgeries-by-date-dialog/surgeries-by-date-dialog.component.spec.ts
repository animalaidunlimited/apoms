import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { SurgeriesByDateDialogComponent } from './surgeries-by-date-dialog.component';

describe('SurgeriesByDateDialogComponent', () => {
  let component: SurgeriesByDateDialogComponent;
  let fixture: ComponentFixture<SurgeriesByDateDialogComponent>;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close'),
};

const surgeriesArray = [{date : new Date()}];

const dialogData = {
  surgeries: surgeriesArray
};

let dialog: MatDialogRef<SurgeriesByDateDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        MatDialogModule,
        BrowserAnimationsModule
      ],
      providers: [ {
        provide: MAT_DIALOG_DATA,
        useValue: dialogData,
      },
      {
          provide: MatDialogRef,
          useValue: mockDialogRef
      }
    ],
      declarations: [ SurgeriesByDateDialogComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SurgeriesByDateDialogComponent);
    component = fixture.componentInstance;

    dialog = TestBed.get(MatDialog);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
