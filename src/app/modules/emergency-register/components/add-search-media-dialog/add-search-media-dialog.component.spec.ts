import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { SearchFieldComponent } from 'src/app/core/components/search-field/search-field.component';
import { MaterialModule } from 'src/app/material-module';
import { routes } from 'src/app/app-routing.module';
import { AddSearchMediaDialogComponent } from './add-search-media-dialog.component';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-add-search-media-dialog',
  template: '<p>Mock add-search-media Component</p>'
})

class MockAddSearchMediaDialogComponent {}

describe('AddSearchMediaDialogComponent', () => {
  let component: AddSearchMediaDialogComponent;
  let fixture: ComponentFixture<AddSearchMediaDialogComponent>;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close')
  };

  const dialogData = {};

  let dialog: MatDialogRef<MockAddSearchMediaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        MaterialModule,
        MatDialogModule,
        BrowserAnimationsModule,
        RouterTestingModule.withRoutes(routes),
      ],
      declarations: [
        AddSearchMediaDialogComponent,
        SearchFieldComponent
      ],
      providers: [
        MatSnackBar,
        DatePipe,
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData },
        {
        provide: MatDialogRef,
        useValue: mockDialogRef
      }],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddSearchMediaDialogComponent);
    component = fixture.componentInstance;

    dialog = TestBed.get(MatDialog);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
