import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/material-module';

import { StaffRotationPageComponent } from './staff-rotation-page.component';

describe('StaffRotationPageComponent', () => {
  let component: StaffRotationPageComponent;
  let fixture: ComponentFixture<StaffRotationPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({imports: [     
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        MaterialModule,
        BrowserAnimationsModule
      ],
      declarations: [ StaffRotationPageComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StaffRotationPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
