import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { inject, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';
import { SearchFieldComponent } from './search-field.component';
import { RouterTestingModule } from '@angular/router/testing';
import { sideNavPath } from 'src/app/nav-routing';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-search-field',
  template: '<p>Mock app-search-field Component</p>'
})
class MockSearchFieldComponent {}

describe('SearchFieldComponent', () => {
  let component: SearchFieldComponent;
  let fixture: ComponentFixture<SearchFieldComponent>;

  const mockDialogRef = {
    open: jasmine.createSpy('open'),
    close: jasmine.createSpy('close')
  };

  const dialogData = {};

  let dialog: MatDialogRef<MockSearchFieldComponent>;


  beforeEach(async() => {
    await TestBed.configureTestingModule({
      imports: [
            RouterTestingModule.withRoutes([
            {
                path: sideNavPath,
                children: [],
            }
        ]),
        HttpClientTestingModule,
        FormsModule,
        MaterialModule,
        ReactiveFormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        DatePipe,
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData
        },
        {
        provide: MatDialogRef,
        useValue: mockDialogRef
        }
      ],
      declarations: [ SearchFieldComponent, MockSearchFieldComponent ],
      schemas: [ CUSTOM_ELEMENTS_SCHEMA ]
    }).compileComponents();
  });

   beforeEach(inject([FormBuilder], (fb: FormBuilder) => {

    fixture = TestBed.createComponent(SearchFieldComponent);
    component = fixture.componentInstance;

    dialog = TestBed.get(MatDialog);

    fixture.detectChanges();
   }));


  it('should create', () => {
    expect(component).toBeTruthy();
  });

});
