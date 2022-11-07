/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed, inject } from '@angular/core/testing';


import { GenericTableComponent } from './generic-table.component';
import { of } from 'rxjs';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { MaterialModule } from 'src/app/material-module';

describe('GenericTableComponent', () => {
  let component: GenericTableComponent;
  let fixture: ComponentFixture<GenericTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({imports: [     
      HttpClientTestingModule,
      FormsModule,
      ReactiveFormsModule,
      RouterTestingModule,
      MaterialModule,
      BrowserAnimationsModule
  ],
      declarations: [ GenericTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(inject([FormBuilder], (fb: FormBuilder) => {
    fixture = TestBed.createComponent(GenericTableComponent);
    component = fixture.componentInstance;

    component.data = of([]);
    component.dataName = "";


    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
