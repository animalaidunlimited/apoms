import { Overlay, OverlayModule } from '@angular/cdk/overlay';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { async, ComponentFixture, inject, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule, FormBuilder } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { sideNavPath } from 'src/app/nav-routing';

import { CensusRecordComponent } from './census-record.component';

describe('CensusRecordComponent', () => {
  let component: CensusRecordComponent;
  let fixture: ComponentFixture<CensusRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        ReactiveFormsModule,
        BrowserAnimationsModule,
        OverlayModule,
        FormsModule
      ],
      providers: [MatSnackBar, Overlay],
      declarations: [ CensusRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {

    fixture = TestBed.createComponent(CensusRecordComponent);
    component = fixture.componentInstance;

    component.censusUpdateDate = new Date();
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
