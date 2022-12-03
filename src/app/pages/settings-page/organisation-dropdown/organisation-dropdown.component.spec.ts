import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { UntypedFormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MaterialModule } from 'src/app/material-module';
import { OrganisationDropdownComponent } from './organisation-dropdown.component';

describe('ProblemComponent', () => {
  let component: OrganisationDropdownComponent;
  let fixture: ComponentFixture<OrganisationDropdownComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports:  [ FormsModule,
                  ReactiveFormsModule,
                  BrowserAnimationsModule,
                  HttpClientTestingModule,
                  MaterialModule
                ],
      declarations: [ OrganisationDropdownComponent ],
      providers: [ MatSnackBar, Overlay ]
    })
    .compileComponents();
  });

  beforeEach(inject([UntypedFormBuilder], (fb: UntypedFormBuilder) => {
    fixture = TestBed.createComponent(OrganisationDropdownComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
