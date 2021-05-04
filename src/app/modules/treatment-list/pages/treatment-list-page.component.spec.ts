import { Overlay } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { sideNavPath } from 'src/app/nav-routing';

import { TreatmentListPageComponent } from './treatment-list-page.component';

describe('TreatmentListPageComponent', () => {
  let component: TreatmentListPageComponent;
  let fixture: ComponentFixture<TreatmentListPageComponent>;

  const formBuilder: FormBuilder = new FormBuilder();


  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [
      HttpClientTestingModule,
      FormsModule,
      ReactiveFormsModule,
      BrowserAnimationsModule,
      RouterTestingModule.withRoutes([
        {
            path: sideNavPath,
            children: [],
        }
      ])
    ],
      declarations: [ TreatmentListPageComponent ],
      providers: [
        MatSnackBar,
        Overlay,
        { provide: FormBuilder, useValue: formBuilder }
      ]
    })
    .compileComponents();
  });

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    fixture = TestBed.createComponent(TreatmentListPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));


  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
