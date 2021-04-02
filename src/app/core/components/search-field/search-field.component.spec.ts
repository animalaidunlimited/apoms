import { HttpClientTestingModule } from "@angular/common/http/testing";
import { Component, inject } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ReactiveFormsModule, FormsModule, FormBuilder } from "@angular/forms";
import { MatDialogRef, MatDialogModule, MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { SearchFieldComponent } from "./search-field.component";


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
        MatDialogModule,
        HttpClientTestingModule,
        ReactiveFormsModule,
        FormsModule,
        BrowserAnimationsModule
      ],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData },
        {
        provide: MatDialogRef,
        useValue: mockDialogRef
      }],
      declarations: [ SearchFieldComponent, MockSearchFieldComponent ]
    })
    .compileComponents();
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
